import { Injectable, inject } from '@angular/core';
import { Firestore, Timestamp, addDoc, collection, collectionData, DocumentReference, query, where } from '@angular/fire/firestore';
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

    getTransactions(startDate: Date, endDate: Date): Observable<Transaction[]> {
        const khataCollection = collection(this.firestore, 'khata');
        const q = query(
            khataCollection,
            where('transDate', '>=', startDate),
            where('transDate', '<=', endDate)
        );
        return collectionData(q, { idField: 'id' }) as Observable<Transaction[]>;
    }

    addTransaction(transaction: Omit<Transaction, 'id'>): Promise<DocumentReference> {
        return addDoc(collection(this.firestore, 'khata'), transaction);
    }
}