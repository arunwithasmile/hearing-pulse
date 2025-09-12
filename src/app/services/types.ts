import { DocumentReference } from "firebase/firestore/lite";

// Represents the resolved, combined data for a call
export interface Call {
    fullName: string;
    place: string;
    dateTime: string;
    duration: string;
}

export interface RawClient {
    id: string;
    fullName: string;
    phoneNumber: string;
    place: DocumentReference;
}

// Represents a client with their place name resolved
export interface Client {
    id: string;
    fullName: string;
    phoneNumber: string;
    place: string;
}

export interface Place {
    id: string;
    name: string;
}