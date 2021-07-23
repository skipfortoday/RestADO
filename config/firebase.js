var firebase = require("firebase");

var config = {
  apiKey: "AIzaSyBEQW9jtmuXbFern0irXR1umEgkmBr8-3Q",
  authDomain: "tcard-syc.firebaseapp.com",
  databaseURL:
    "https://tcard-syc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tcard-syc",
  storageBucket: "tcard-syc.appspot.com",
  messagingSenderId: "27147994029",
  appId: "1:27147994029:web:e7908897892f6ab8aa1724",
  measurementId: "G-NTWN5RBFG4",
};

var fire = firebase.initializeApp(config);
module.exports = fire;
