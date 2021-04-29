"use strict";

const CREDENTIALS = {
	apiKey : 'AIzaSyDPlArfI6m_vAH63knHzSk4dHylYxcQdPw',
	clientId : '453824233916-gsihim23buhhslutm73b0p8iopqto428.apps.googleusercontent.com',
	discoveryDocs : [
		'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
	],
	scope : [
		'https://www.googleapis.com/auth/drive.metadata.readonly'
	].join(' ')
};

const Session = (function() {

	this.MEM = {
		ready : false
	}

	this.DOM = {
		btn : {
			authorize : document.getElementById('Session.btn.authorize'),
			signout : document.getElementById('Session.btn.signout')
		},
		pre : {
			console : document.getElementById('Session.pre.console')
		}
	}
	
	this.EVT = {
		handleAuthClick : evt_handleAuthClick.bind(this),
		handleSignoutClick : evt_handleSignoutClick.bind(this),
	}

	this.API = {
		loadClient : api_loadClient.bind(this),
		initClient : api_initClient.bind(this),
		updateSigninStatus : api_updateSigninStatus.bind(this),
		initFolder : api_initFolder.bind(this)
	}

	init.apply(this);
	return this;

	function init() {
		
		this.DOM.btn.authorize.addEventListener('click', this.EVT.handleAuthClick);
		this.DOM.btn.signout.addEventListener('click', this.EVT.handleSignoutClick);

	}

	function evt_handleAuthClick() {
		
		if(!this.MEM.ready) {
			return;
		}
		
		gapi.auth2.getAuthInstance().signIn();

	}

	function evt_handleSignoutClick() {
		
		if(!this.MEM.ready) {
			return;
		}

		gapi.auth2.getAuthInstance().signOut();

	}

	function api_loadClient() {

		gapi.load('client:auth2', this.API.initClient)

	}

	async function api_initClient () {
		
		try {
			await gapi.client.init(CREDENTIALS);
		} catch(err) {
			throw err;
		}

		this.ready = true;
		let isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
		this.API.updateSigninStatus(isSignedIn);
		gapi.auth2.getAuthInstance().isSignedIn.listen(this.API.updateSigninStatus);

	}

	function api_updateSigninStatus(isSignedIn) {
		
		if(isSignedIn) {
			this.API.initFolder();
			this.DOM.btn.authorize.style.display = 'none';
			this.DOM.btn.signout.style.display = 'block';
		} else {
			this.MEM = {}
			this.DOM.btn.authorize.style.display = 'block';
			this.DOM.btn.signout.style.display = 'none';
		}

	}

	async function api_initFolder() {

		let query = {
			q : `name = 'whitmir.io' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
			pageSize : 10
		}
		
		let res;
		try {
			res = await gapi.client.drive.files.list(query);
		} catch(err) {
			throw err;
		}
		
		if(res.status !== 200) {
			throw res.body;
		}
		
		let data = JSON.parse(res.body);
		if(data.files.length !== 0) {
			this.MEM.folder = data.files[0].id;
		} else {
			// Otherwise we have to make a new folder
			query = {
				resource : {
					name : 'whitmir.io',
					mimeType : 'application/vnd.google-apps.folder'
				},
				fields : 'id'
			};

			let file;
			
			try {
				file = await gapi.client.drive.files.create(query);
			} catch(err) {
				throw err;
			}
		
			this.MEM.folder = JSON.parse(file.body).id;
		}
		
		console.log(this.MEM.folder);

	}

}).apply({});
