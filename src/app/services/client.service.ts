import { Injectable, inject } from '@angular/core';
import { DocumentReference, Firestore, addDoc, collection, collectionData, doc } from '@angular/fire/firestore';
import { Observable, combineLatest, map } from 'rxjs';
import { Client, Place } from './types';

interface RawClient {
    id: string;
    fullName: string;
    phoneNumber: string;
    place: DocumentReference;
}

@Injectable({
    providedIn: 'root'
})
export class ClientService {
    private firestore: Firestore = inject(Firestore);

    getClients(): Observable<Client[]> {
        const clients$ = collectionData(collection(this.firestore, 'clients'), { idField: 'id' }) as Observable<RawClient[]>;
        const places$ = collectionData(collection(this.firestore, 'places'), { idField: 'id' }) as Observable<Place[]>;

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

    async addClient(clientData: any): Promise<DocumentReference> {
        return addDoc(collection(this.firestore, 'clients'), clientData);
    }

    getPlaces(): Observable<Place[]> {
        return collectionData(collection(this.firestore, 'places'), { idField: 'id' }) as Observable<Place[]>;
    }

    async addPlace(place: { name: string }): Promise<DocumentReference> {
        return addDoc(collection(this.firestore, 'places'), place);
    }
}