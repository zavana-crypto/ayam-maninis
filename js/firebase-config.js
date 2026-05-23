// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// TODO: Replace with your app's Firebase project configuration
// 1. Go to Firebase Console (https://console.firebase.google.com/)
// 2. Create a new project or select an existing one
// 3. Register a web app
// 4. Copy the config object below
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app, db, auth, storage;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization failed. Please update firebaseConfig in js/firebase-config.js", error);
}

export { app, db, auth, storage };

/* 
==================================================
PANDUAN SETUP FIREBASE & DEPLOY GITHUB PAGES
==================================================

1. SETUP FIREBASE:
   - Login ke https://console.firebase.google.com/
   - Buat Project Baru (Misal: Ayam Maninis)
   - Aktifkan "Authentication" -> Pilih metode "Email/Password" -> Aktifkan
   - Tambahkan User Admin di tab "Users" (Contoh: admin@ayammaninis.com / password123)
   - Aktifkan "Firestore Database" -> Mulai dalam "Test Mode" (PENTING: Ganti rules nanti ke production)
   - Aktifkan "Storage" -> Mulai dalam "Test Mode"
   - Pergi ke Project Settings (Ikon Gear) -> Buat Web App (</>)
   - Copy nilai config dan paste ke variabel `firebaseConfig` di atas.

2. SETUP DATABASE AWAL (Opsional tapi disarankan):
   - Setelah login ke Admin Dashboard, Anda bisa langsung mengisi form Profil, Menu, dan Galeri.
   - Data otomatis akan dibuat di koleksi Firestore: 'profile', 'menu', dan 'gallery'.

3. DEPLOY KE GITHUB PAGES:
   - Buat repository baru di GitHub (misal: ayam-maninis-web)
   - Push semua file di folder ini ke repository tersebut:
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/USERNAME/ayam-maninis-web.git
     git push -u origin main
   - Di GitHub repository, buka Settings -> Pages
   - Pada bagian "Build and deployment" (Source), pilih "Deploy from a branch"
   - Pilih branch "main", folder "/ (root)" lalu klik Save.
   - Tunggu beberapa menit, website Anda akan live di https://USERNAME.github.io/ayam-maninis-web/

4. KEAMANAN (FIRESTORE RULES):
   Setelah selesai setup, ubah rules Firestore agar hanya admin yang bisa mengedit data:
   
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
*/