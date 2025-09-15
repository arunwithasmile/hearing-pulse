import { Injectable, inject } from '@angular/core';
import { DocumentReference, Firestore, addDoc, collection, collectionData, doc, docData, updateDoc } from '@angular/fire/firestore';
import { Observable, combineLatest, firstValueFrom, map, of, switchMap } from 'rxjs';
import { Client, Place, RawClient } from './types';

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
                        place: placesMap.get(client.place?.id) ?? 'Unknown Place'
                    } as Client;
                });
            })
        );
    }

    getClientById(id: string): Observable<Client | undefined> {
        const clientDocRef = doc(this.firestore, `clients/${id}`);
        return (docData(clientDocRef, { idField: 'id' }) as Observable<RawClient | undefined>)
            .pipe(
                switchMap(client => {
                    if (!client) {
                        return of(undefined); // If no client, return an observable of undefined
                    }

                    if (!client.place?.path) {
                        return of({ ...client, place: '' } as Client);
                    }
                    const placeDocRef = doc(this.firestore, client.place.path);
                    return (docData(placeDocRef) as Observable<Place>).pipe(
                        map(place => {
                            return { ...client, place: place.name } as Client;
                        })
                    );
                })
            );
    }

    async updateClient(id: string, clientData: { fullName: string, phoneNumber: string, place: string }) {
        const clientDocRef = doc(this.firestore, `clients/${id}`);

        // The 'place' from the form is a string name. We need to find or create
        // the corresponding place document to get its reference.
        const places = await firstValueFrom(this.getPlaces());
        let placeRef: DocumentReference;
        const existingPlace = places.find(p => p.name.toLowerCase() === clientData.place.toLowerCase());

        if (existingPlace) {
            placeRef = doc(this.firestore, `places/${existingPlace.id}`);
        } else {
            // If the place doesn't exist, create it.
            placeRef = await this.addPlace({ name: clientData.place });
        }
        return updateDoc(clientDocRef, { ...clientData, place: placeRef });
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

    async getOrCreatePlace(placeName: string): Promise<DocumentReference> {
        const places = await firstValueFrom(this.getPlaces());
        const existingPlace = places.find(p => p.name.toLowerCase() === placeName.toLowerCase());

        if (existingPlace) {
            return doc(this.firestore, `places/${existingPlace.id}`);
        } else {
            // If it doesn't exist, create it.
            return this.addPlace({ name: placeName });
        }
    }
}