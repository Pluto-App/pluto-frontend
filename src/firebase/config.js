import firebase from 'firebase'

export const firebaseConfig = {
  apiKey: "AIzaSyAWQsHvViga7JaVKZ6wsEUvR65SGEeD1QU",
  authDomain: "pluto-app-84156.firebaseapp.com",
  databaseURL: "https://pluto-app-84156.firebaseio.com",
  projectId: "pluto-app-84156",
  storageBucket: "pluto-app-84156.appspot.com",
  messagingSenderId: "359624801733",
  appId: "1:359624801733:web:d74095acf41c63294f9fac",
  measurementId: "G-M71ESPJQTE"
};

firebase.initializeApp(firebaseConfig)

export const ref = firebase.database().ref()
export const firebaseAuth = firebase.auth
export const frbase = firebase