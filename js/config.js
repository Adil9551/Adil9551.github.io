var firebaseConfig = {
    apiKey: "AIzaSyA21V0NE1NPuFCho6kNTS8fJ8dfynaGfDs",
    authDomain: "forward-rain-281715.firebaseapp.com",
    databaseURL: "https://forward-rain-281715.firebaseio.com",
    projectId: "forward-rain-281715",
    storageBucket: "forward-rain-281715.appspot.com",
    messagingSenderId: "556344360225",
    appId: "1:556344360225:web:82c63fc0778c19effd5260",
    measurementId: "G-HBG7CSKH5L"
};
// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    dbh = firebase.firestore();
    dbs = firebase.storage();
    //firebase.analytics();
    
}