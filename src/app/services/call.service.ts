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
                        calls: []
                    }];
                }));

                // Group calls by client
                for (const call of calls) {
                    const client = clientsWithCalls.get(call.client.id);
                    if (client) {
                        (client.calls as any[]).push({
                            ...call,
                            dateTime: this.convertToDateTime(call.timestamp),
                            duration: this.convertToText(call.durationMills),
                            followUpDateTime: this.convertToDateTime(call.followUpTimestamp)
                        });
                    };
                }

                return Array.from(clientsWithCalls.values());
            })
        );
    }

    // TODO Make it a pipe
    private convertToDateTime(timestamp: Timestamp | undefined): string {
        if (!timestamp) {
            return '';
        }
        const callDate = timestamp.toDate();
        const now = new Date();

        const isCurrentYear = callDate.getFullYear() === now.getFullYear();

        // Check if the call was made today
        const isToday = isCurrentYear &&
            callDate.getMonth() === now.getMonth() &&
            callDate.getDate() === now.getDate();

        if (isToday) {
            // Format as hh:mm am/pm
            return callDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        } else if (isCurrentYear) {
            // Format as dd MMM for dates in the current year but not today
            return callDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        } else {
            // Format as dd MMM yyyy for dates in previous years
            return callDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }
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