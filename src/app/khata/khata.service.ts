import { Injectable, inject } from '@angular/core';
import { Firestore, Timestamp, collection, collectionData, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Transaction {
    id: string;
    amount: number;
    title: string;
    type: 'credit' | 'debit';
    transDate: Timestamp;
    client?: DocumentReference;
}

@Injectable({
    providedIn: 'root'
})
export class KhataService {
    private firestore: Firestore = inject(Firestore);

    getTransactions(): Observable<Transaction[]> {
        const khataCollection = collection(this.firestore, 'khata');
        return collectionData(khataCollection, { idField: 'id' }) as Observable<Transaction[]>;
    }
}