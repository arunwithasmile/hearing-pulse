import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, initializeFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';

import { routes } from './app.routes';
import { BrowserModule } from '@angular/platform-browser';

const firebaseConfig = {
  apiKey: "SAVED_PRIVATELY",
  authDomain: "pulse-asp.firebaseapp.com",
  projectId: "pulse-asp",
  storageBucket: "pulse-asp.firebasestorage.app",
  messagingSenderId: "165975462947",
  appId: "1:165975462947:web:14f20ed3e6b73242e1cd96",
  measurementId: "G-1NPNNB4SXZ"
};

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(BrowserModule),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()), // Connects to default db
    // provideFirestore(() => initializeFirestore(getApp(), {}, 'pulse')), // Connects to 'pulse' db
    provideAuth(() => getAuth()),

    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};
