import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  projectId: 'koyomict',
  appId: '1:960580141609:web:7de16c1f9596d1c80f9238',
  storageBucket: 'koyomict.firebasestorage.app',
  apiKey: 'AIzaSyDQBSZTLOzEEfiPKPWwskb-e6WKMSScgew',
  authDomain: 'koyomict.firebaseapp.com',
  messagingSenderId: '960580141609',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
