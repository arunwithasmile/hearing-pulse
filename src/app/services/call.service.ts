import { Injectable, inject } from '@angular/core';
import { DocumentReference, Firestore, Timestamp, addDoc, collection, collectionData, doc, docData, orderBy, query } from '@angular/fire/firestore';
import { Observable, combineLatest, map } from 'rxjs';
import { Call, Place, RawClient } from './types';

// Represents the raw data from the 'calls' collection
interface RawCall {
    client: DocumentReference;
    timestamp: Timestamp;
    summary: string;
    wasSuccessful: boolean;
    followUpTimestamp?: Timestamp;
    durationMills: string;
}

@Injectable({
    providedIn: 'root'
})
export class CallService {
    async addCall(callData: {
        clientRef: DocumentReference;
        callDateTime: string;
        callDuration: string;
        summary: string;
        wasSuccessful: boolean;
        followUpDateTime?: string;
    }): Promise<DocumentReference> {
        const durationInMs = callData.callDuration ? parseInt(callData.callDuration, 10) * 60000 : 0;
        const rawCall: Partial<RawCall> = {
            client: callData.clientRef,
            timestamp: Timestamp.fromDate(new Date(callData.callDateTime)),
            durationMills: durationInMs.toString(),
            summary: callData.summary,
            wasSuccessful: callData.wasSuccessful,
            ...(callData.followUpDateTime && { followUpTimestamp: Timestamp.fromDate(new Date(callData.followUpDateTime)) })
        };
        return addDoc(collection(this.firestore, 'calls'), rawCall);
    }

    private firestore: Firestore = inject(Firestore);

    getCalls(): Observable<any[]> {
        const places$ = collectionData(collection(this.firestore, 'places'), { idField: 'id' }) as Observable<Place[]>;
        const clients$ = collectionData(collection(this.firestore, 'clients'), { idField: 'id' }) as Observable<RawClient[]>;
        const callsQuery = query(collection(this.firestore, 'calls'), orderBy('timestamp', 'desc'));
        const calls$ = collectionData(callsQuery, { idField: 'id' }) as Observable<RawCall[]>;

        return combineLatest([calls$, clients$, places$]).pipe(
            map(([calls, clients, places]) => {
                // Create lookup maps for efficient access
                const placesMap = new Map(places.map(place => [place.id, place]));

                // Initialize clients with an empty calls array
                const clientsWithCalls = new Map(clients.map(client => {
                    return [client.id, {
                        ...client,
                        place: placesMap.get(client.place.id)?.name ?? 'Unknown Place',
                        calls: [] as (RawCall & { duration: string })[]
                    }];
                }));

                // Group calls by client
                for (const call of calls) {
                    const client = clientsWithCalls.get(call.client.id);
                    if (client) {
                        client.calls.push({
                            ...call,
                            duration: this.convertToText(call.durationMills),
                        });
                    };
                }

                const sortedClients = Array.from(clientsWithCalls.values())
                    .sort((a, b) => {
                        // If a client has no calls, they should appear after clients with calls.
                        if (a.calls.length === 0) return 1;
                        if (b.calls.length === 0) return -1;
                        // The calls are already sorted desc, so the first call is the latest.
                        return b.calls[0].timestamp.toMillis() - a.calls[0].timestamp.toMillis();
                    });
                return sortedClients;
            })
        );
    }

    private convertToText(durationMillis: string): string {
        const millis = parseInt(durationMillis, 10);
        if (isNaN(millis) || millis < 0) {
            return '0s';
        }

        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return !seconds ? `${minutes}m` : `${minutes}m ${seconds}s`;
    }
}