// Profile Menu

const login = document.getElementById('login');
const profileToggle = document.getElementById('profile-toggle');
const profileMenu = document.getElementById('profile-menu');

profileToggle.addEventListener('click', function() {
	profileMenu.classList.toggle('hide');
	exportMenu.classList.add('hide');
});

// Export Menu

const exportToggle = document.getElementById('export-toggle');
const exportMenu = document.getElementById('export-menu');

exportToggle.addEventListener('click', function() {
	exportMenu.classList.toggle('hide');
	profileMenu.classList.add('hide');
});

// Category Menu

const categoryToggle = document.getElementById('category-toggle');
const categoryMenu = document.getElementById('category-menu');

categoryToggle.addEventListener('click', function() {
	categoryMenu.classList.toggle('open');
});

// Settings Menu

const settingsToggle = document.getElementById('settings-toggle');
const settingsMenu = document.getElementById('settings-menu');

settingsToggle.addEventListener('click', function() {
	settingsMenu.classList.toggle('hide');
});

// Quill Editor

const quill = new Quill('#editor');

// Google Login

function onSignIn(googleUser) {
	var profile = googleUser.getBasicProfile();
	console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
	console.log('Name: ' + profile.getName());
	console.log('Image URL: ' + profile.getImageUrl());
	console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
}

const signout = document.getElementById('signout');
signout.addEventListener('click', function() {
	var auth2 = gapi.auth2.getAuthInstance();
	auth2.signOut().then(function () {
		console.log('User signed out.');
	});
	exportMenu.classList.add('hide');
	profileMenu.classList.add('hide');
});

var auth2; // The Sign-In object.
var googleUser; // The current user.


/**
 * Calls startAuth after Sign in V2 finishes setting up.
 */
var appStart = function() {
  gapi.load('auth2', initSigninV2);
};


/**
 * Initializes Signin v2 and sets up listeners.
 */
var initSigninV2 = function() {
	
	auth2 = gapi.auth2.getAuthInstance({
		client_id: '453824233916-gsihim23buhhslutm73b0p8iopqto428.apps.googleusercontent.com',
 		scope: 'profile drive'
	});

	// Listen for sign-in state changes.
	auth2.isSignedIn.listen(signinChanged);

	// Listen for changes to current user.
	auth2.currentUser.listen(userChanged);

	// Sign in the user if they are currently signed in.
	if (auth2.isSignedIn.get() == true) {
		auth2.signIn();
	} else {
		console.log('WE ARE NOT SIGNED IN!!!');
		signinChanged(false);
	}

	// Start with the current live values.
	refreshValues();

};


/**
 * Listener method for sign-out live value.
 *
 * @param {boolean} val the updated signed out state.
 */
var signinChanged = function (val) {
	console.log('Signin state changed to ', val);
	console.log(val);

	if(!val) {
		console.log('We are NOT Signed in');

		profileToggle.classList.add('hide');
		exportToggle.classList.add('hide');
		login.classList.remove('hide');
		console.log(login);

	} else {

		profileToggle.classList.remove('hide');
		exportToggle.classList.remove('hide');
		login.classList.add('hide');

	}
};


/**
 * Listener method for when the user changes.
 *
 * @param {GoogleUser} user the updated user.
 */

var userChanged = function (user) {
  console.log('User now: ', user);
  googleUser = user;
  updateGoogleUser();
};


/**
 * Updates the properties in the Google User table using the current user.
 */

var updateGoogleUser = function () {
	if (!googleUser) {
		return;
	}
	
	console.log("Google USER!!!");
	console.log(googleUser.getId());
	console.log(googleUser.getGrantedScopes());
	console.log(googleUser.getAuthResponse());

  var profile = googleUser.getBasicProfile();
  if(!profile) {
	return;
  }
  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
	
	let img = profile.getImageUrl();
	profileToggle.style.backgroundImage = `url(${img})`;
	document.getElementById('profile.name').textContent = profile.getName();
	document.getElementById('profile.email').textContent = profile.getEmail();

};

/**
 * Retrieves the current user and signed in states from the GoogleAuth
 * object.
 */

var refreshValues = function() {
  if (auth2){
    console.log('Refreshing values...');

    googleUser = auth2.currentUser.get();
	console.log(googleUser);
	console.log(auth2.isSignedIn.get());
    updateGoogleUser();
  }
}

window.onload = initSigninV2;
