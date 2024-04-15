import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

const firebaseConfig = {
    "apiKey": process.env.REACT_APP_FIREBASE_API_KEY,
    "authDomain": "mirrorfly-webuikit.firebaseapp.com",
    "databaseURL": "",
    "projectId": "mirrorfly-webuikit",
    "storageBucket": "",
    "messagingSenderId": ""
};

firebase.initializeApp(firebaseConfig);

export default firebase;