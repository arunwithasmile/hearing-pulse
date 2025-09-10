import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';

const firebaseConfig = {
  apiKey: "AIzaSyAqpIjGv7fHv0Tt_KBpTeaifJj1hhOFiE4",
  authDomain: "pulse-asp.firebaseapp.com",
  projectId: "pulse-asp",
  storageBucket: "pulse-asp.firebasestorage.app",
  messagingSenderId: "165975462947",
  appId: "1:165975462947:web:14f20ed3e6b73242e1cd96",
  measurementId: "G-1NPNNB4SXZ"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),

    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};
