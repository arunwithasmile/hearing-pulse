import { Injectable, inject } from '@angular/core';
import { Firestore, Timestamp, addDoc, collection, collectionData, DocumentReference, query, where, orderBy, doc, updateDoc, docData } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';

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
            where('transDate', '<=', endDate),
            orderBy('transDate', 'desc')
        );
        return collectionData(q, { idField: 'id' }) as Observable<Transaction[]>;
    }

    addTransaction(transaction: Omit<Transaction, 'id'>): Promise<DocumentReference> {
        return addDoc(collection(this.firestore, 'khata'), transaction);
    }

    getTransactionById(id: string | null): Observable<Transaction | undefined> {
        if (!id) {
            return of(undefined);
        }
        const transactionDocRef = doc(this.firestore, `khata/${id}`);
        return docData(transactionDocRef, { idField: 'id' }) as Observable<Transaction>;
    }

    updateTransaction(transaction: Partial<Transaction>): Promise<void> {
        const transactionDocRef = doc(this.firestore, `khata/${transaction.id}`);
        return updateDoc(transactionDocRef, transaction);
    }
}