import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(), provideFirebaseApp(() => initializeApp({"projectId":"miniproyecto-561b9","appId":"1:1019422216789:web:415a54c5f7b3a360b83adc","storageBucket":"miniproyecto-561b9.appspot.com","apiKey":"AIzaSyByKKRL3FvkR6km-TAPS6ih4mvBnK_-hY8","authDomain":"miniproyecto-561b9.firebaseapp.com","messagingSenderId":"1019422216789"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};
