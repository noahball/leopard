function writeUserData() {
  var userEmail = document.getElementById("email_field").value;
  var userName = document.getElementById("name_field").value;

  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;

  firebase.auth().signInWithEmailAndPassword(userEmail, userPass).then(function () {
    var currentUser = firebase.auth().currentUser;
    var uid = currentUser.uid;

    var school = document.getElementById('schoolName').value;
    firebase.database().ref('/users/' + school + '/' + uid).set({
      name: userName,
      email: userEmail,
      role: "administrator"
    });

    firebase.auth().currentUser.getIdToken( /* forceRefresh */ true).then(function (idToken) {
      console.log(idToken);
      document.cookie = `sessionid=` + idToken + `; expires=Sat, 20 Apr 2069 12:00:00 UTC; path=/`;
      window.location = "/admin";
    }).catch(function (error) {
      console.log(`ID Token failure.\n\nDEBUG INFORMATION FOR NERDS:\n\n` + error);
    });

  }).catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;

    Swal.fire({
      title: 'And I oop!',
      text: 'An error occured. ' + errorMessage + ' Or just give up and save the turtles instead. Up to you!',
      icon: 'error',
      confirmButtonText: 'sksksksk'
    })
  });
}

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.

    document.getElementById("user_div").style.display = "block";
    document.getElementById("login_div").style.display = "none";

    var user = firebase.auth().currentUser;

    firebase.auth().currentUser.getIdToken( /* forceRefresh */ true).then(function (idToken) {
      console.log(idToken);
      document.cookie = `sessionid=` + idToken + `; expires=Sat, 20 Apr 2069 12:00:00 UTC; path=/`;
      // window.location = "/admin";
    }).catch(function (error) {
      console.log(`ID Token failure.\n\nDEBUG INFORMATION FOR NERDS:\n\n` + error);
    });

    if (user != null) {

      getUserInfo();

    }

  } else {
    // No user is signed in.

    document.getElementById("user_div").style.display = "none";
    document.getElementById("login_div").style.display = "block";

  }
});

function login() {

  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;

  firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;

    Swal.fire({
      title: 'And I oop!',
      text: 'An error occured. ' + errorMessage + ' Or just give up and save the turtles instead. Up to you!',
      icon: 'error',
      confirmButtonText: 'sksksksk'
    })
  });

}

function logout() {
  firebase.auth().signOut();
  document.cookie = "sessionid= ; expires = Thu, 01 Jan 1970 00:00:00 GMT"
}

function getUserInfo() {
  var school = document.getElementById('schoolName').value;
  var schoolFull = document.getElementById('schoolFullName').value;
  var currentUser = firebase.auth().currentUser;
  var uid = currentUser.uid;
  console.log(`/users/` + school + `/` + uid);
  return firebase.database().ref(`/users/` + school + `/` + uid).once('value').then(function (snapshot) {
    // YES THIS IS TECHNICALLY FAKE LOADING... however if this wasn't implemented you would see a brief corrupt message while the app is connecting to Firebase.
    setTimeout(() => {
      if (!snapshot.exists()) {
        document.getElementById("user_para").innerHTML = "Your account is not authorised to login to " + schoolFull + "'s Leopard Dashboard.";
      } else {
        var userName = snapshot.val().name;
        var role = snapshot.val().role;
        document.getElementById("user_para").innerHTML = "Hiya, " + userName + "<br>You are an " + role + ".";
      }
    }, 1200);
  });

}

function signUp() {

  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;

  firebase.auth().createUserWithEmailAndPassword(userEmail, userPass).then(function () {
    setTimeout(writeUserData(), 2000);
  }).catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;

    Swal.fire({
      title: 'And I oop!',
      text: 'An error occured. ' + errorMessage + ' Or just give up and save the turtles instead. Up to you!',
      icon: 'error',
      confirmButtonText: 'sksksksk'
    })

  });
}

function loginAfterSignUp() {

  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;

  firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;

    console.log(errorMessage);
  });

  writeUserData();

}

const queryString = window.location.search;
if (queryString == '?action=logout') {
  logout();
}