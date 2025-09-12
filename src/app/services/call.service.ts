import { Injectable, inject } from '@angular/core';
import { DocumentReference, Firestore, collection, collectionData, docData } from '@angular/fire/firestore';
import { Observable, combineLatest, map } from 'rxjs';
import { Call, Client } from './types';
import { Timestamp } from 'firebase/firestore/lite';

// Represents the raw data from the 'calls' collection
interface RawCall {
    client: DocumentReference;
    timestamp: Timestamp;
    summary: string;
    wasSuccessful: boolean;
    followUpTimestamp: Timestamp;
    durationMills: string;
}

interface RawClient {
    id: string;
    fullName: string;
    phoneNumber: string;
    place: DocumentReference;
}

interface RawPlace {
    id: string;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class CallService {
    private firestore: Firestore = inject(Firestore);

    getCalls(): Observable<Call[]> {
        const places$ = collectionData(collection(this.firestore, 'places'), { idField: 'id' }) as Observable<RawPlace[]>;
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
                        dateTime: this.convertToDateTime(call.timestamp),
                        duration: this.convertToText(call.durationMills),
                        followUpDateTime: this.convertToDateTime(call.followUpTimestamp)
                    };
                });
            })
        );
    }

    // TODO Make it a pipe
    private convertToDateTime(timestamp: Timestamp): string {
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

    getClients(): Observable<Client[]> {
        const clients$ = collectionData(collection(this.firestore, 'clients'), { idField: 'id' }) as Observable<RawClient[]>;
        const places$ = collectionData(collection(this.firestore, 'places'), { idField: 'id' }) as Observable<RawPlace[]>;

        return combineLatest([clients$, places$]).pipe(
            map(([clients, places]) => {
                const placesMap = new Map(places.map(p => [p.id, p.name]));
                return clients.map(client => {
                    return {
                        ...client,
                        place: placesMap.get(client.place.id) ?? 'Unknown Place'
                    } as Client;
                });
            })
        );
    }
}