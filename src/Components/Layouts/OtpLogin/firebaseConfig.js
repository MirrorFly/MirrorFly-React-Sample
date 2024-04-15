import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

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