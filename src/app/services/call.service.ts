import { Injectable, inject } from '@angular/core';
import { DocumentReference, Firestore, Timestamp, addDoc, collection, collectionData, doc, docData } from '@angular/fire/firestore';
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

    getCalls(): Observable<Call[]> {
        const places$ = collectionData(collection(this.firestore, 'places'), { idField: 'id' }) as Observable<Place[]>;
        const clients$ = collectionData(collection(this.firestore, 'clients'), { idField: 'id' }) as Observable<RawClient[]>;
        const calls$ = collectionData(collection(this.firestore, 'calls')) as Observable<RawCall[]>;

        // 2. Combine the latest emissions from all three streams
        return combineLatest([calls$, clients$, places$]).pipe(
            map(([calls, clients, places]) => {
                // 3. Create lookup maps for efficient access (O(1) lookup)
                const clientsMap = new Map(clients.map(client => [client.id, client]));
                const placesMap = new Map(places.map(place => [place.id, place]));

                // 4. Join the data
                return calls.map(call => {
                    const client = clientsMap.get(call.client.id);
                    const place = client ? placesMap.get(client.place.id) : undefined;

                    return <Call>{
                        fullName: client?.fullName,
                        place: place?.name ?? '',
                        summary: call.summary,
                        wasSuccessful: call.wasSuccessful,
                        dateTime: this.convertToDateTime(call.timestamp), // convertToDateTime handles null
                        duration: this.convertToText(call.durationMills),
                        followUpDateTime: this.convertToDateTime(call.followUpTimestamp!)
                    };
                });
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