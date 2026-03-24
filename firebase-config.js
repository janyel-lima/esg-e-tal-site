// ─────────────────────────────────────────────────────────────────────────────
//  firebase-config.js  —  ESG e Tal CMS
//
//  1. Crie um projeto em https://console.firebase.google.com
//  2. Ative Authentication → Email/Senha
//  3. Ative Realtime Database
//  4. Cole as credenciais abaixo
//  5. Nas Regras do Realtime Database, defina:
//
//     {
//       "rules": {
//         ".read": true,
//         ".write": "auth != null"
//       }
//     }
//
//  ⚠️  As chaves do Firebase para web são públicas por design.
//       A segurança é garantida pelas Regras do Database, não pelo sigilo das chaves.
// ─────────────────────────────────────────────────────────────────────────────

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD0GsoqSLeIR8kTIfQZmQeKiyfYrh2fBsE",
    authDomain: "site-demo-8ce53.firebaseapp.com",
    databaseURL: "https://site-demo-8ce53-default-rtdb.firebaseio.com",
    projectId: "site-demo-8ce53",
    storageBucket: "site-demo-8ce53.firebasestorage.app",
    messagingSenderId: "673364852833",
    appId: "1:673364852833:web:43b1373e3c437f4b296a20",
    measurementId: "G-K96Y87M8RQ"
};