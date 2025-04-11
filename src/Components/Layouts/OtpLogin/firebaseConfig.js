import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
    "apiKey": "AIzaSyBsDgqVCPQkReMH5BlmXGxRirPYzKgSdE0",
    "authDomain": "mirrorfly-uikit.firebaseapp.com",
    "databaseURL": "",
    "projectId": "mirrorfly-uikit",
    "storageBucket": "",
    "messagingSenderId": ""
};

firebase.initializeApp(firebaseConfig);

export default firebase;