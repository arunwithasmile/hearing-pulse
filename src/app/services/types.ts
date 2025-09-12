// Represents the resolved, combined data for a call
export interface Call {
    fullName: string;
    place: string;
    dateTime: string;
    duration: string;
}

// Represents a client with their place name resolved
export interface Client {
    id: string;
    fullName: string;
    phoneNumber: string;
    place: string;
}