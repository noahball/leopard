function writeUserData() {
  var userEmail = document.getElementById("email_field").value;
  var userName = document.getElementById("name_field").value;
  var cutEmail = userEmail.substring(0, userEmail.lastIndexOf("@"));

  var school = "aquinas";
  firebase.database().ref('/users/' + school + '/' + cutEmail).set({
    name: userName,
    email: userEmail,
    role: "administrator"
  });
}

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.

    // Show info UI (commented out as we'll simply just redirect to the admin dashboard)
    // document.getElementById("user_div").style.display = "block";
    // document.getElementById("login_div").style.display = "none";
    // document.getElementById("dashboard-button").style.display = "block";

    var user = firebase.auth().currentUser;

    firebase.auth().currentUser.getIdToken( /* forceRefresh */ true).then(function (idToken) {
      console.log(idToken);
      document.cookie = `sessionid=` + idToken + `; expires=Sat, 20 Apr 2069 12:00:00 UTC; path=/`;
      window.location = "/admin";
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
}

function getUserInfo() {
  var email = firebase.auth().currentUser.email;
  var cutEmail = email.substring(0, email.lastIndexOf("@"));
  var school = "aquinas";
  return firebase.database().ref(`/users/` + school + `/` + cutEmail).once('value').then(function (snapshot) {
    // YES THIS IS TECHNICALLY FAKE LOADING... however if this wasn't implemented you would see a brief corrupt message while the app is connecting to Firebase.
    setTimeout(() => {
      if (!snapshot.exists()) {
        document.getElementById("user_para").innerHTML = "OH NO! It appears your account is corrupt. Please contact Leopard support for further assistance.";
        document.getElementById("dashboard-button").style.display = "none";
      } else {
        var userName = snapshot.val().name;
        var role = snapshot.val().role;
        document.getElementById("user_para").innerHTML = "Kia ora, " + userName + "<br>Permissions: " + role;
      }
    }, 1200);
  });

}

function signUp() {

  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;

  firebase.auth().createUserWithEmailAndPassword(userEmail, userPass).catch(function (error) {
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

  writeUserData();
  loginAfterSignUp();

}

function loginAfterSignUp() {

  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;

  firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;

    // ...
  });

}