import { ref, firebaseAuth } from './config'
import firebase from 'firebase'

var provider = new firebase.auth.GoogleAuthProvider();

export function google_auth () {
  return firebaseAuth().signInWithPopup(provider)
  .then(saveUser)
  .catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    var email = error.email;
    var credential = error.credential;
  });
}

export function google_logout () {
  firebaseAuth().signOut().then(function () {
  }).catch(function (error) {
    });
}

export function sendEmailVerification() {
  firebase.auth().currentUser.sendEmailVerification().then(function () {
    alert('Welcome Email with authentication link sent.');
  });
}

export function auth (email, password) {
  return firebaseAuth().createUserWithEmailAndPassword(email, password)
    .then(saveUser)
    .catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode == 'auth/weak-password') {
        alert('The password is too weak.');
      } else {
        alert(errorMessage);
      }
      console.log(error);
    });
}

export function logout () {
  return firebaseAuth().signOut()
}

export function login (email, password) {
  return firebaseAuth().signInWithEmailAndPassword(email, password)
    .catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode === 'auth/wrong-password') {
        alert('Wrong password.');
      } else {
        alert(errorMessage);
      }
    });
}

export function resetPassword (email) {
  return firebaseAuth().sendPasswordResetEmail(email)
}

export function saveUser (user) {
  var userId = firebaseAuth().currentUser.uid;
  return ref.child(`users/${userId}/info`)
    .push({
      uuid: userId,
      email: user.email,
      uid: user.uid
    })
    .then(() => user)
}