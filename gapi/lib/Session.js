"use strict";

const CREDENTIALS = {
	apiKey : 'AIzaSyDPlArfI6m_vAH63knHzSk4dHylYxcQdPw',
	clientId : '453824233916-gsihim23buhhslutm73b0p8iopqto428.apps.googleusercontent.com',
	discoveryDocs : [
		'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
	],
	scope : [
		'https://www.googleapis.com/auth/drive.metadata.readonly',
		'https://www.googleapis.com/auth/drive.file'
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
		initFolder : api_initFolder.bind(this),
		initConfig : api_initConfig.bind(this),
		updateConfig : api_updateConfig.bind(this)
	}

	init.apply(this);
	return this;

	function init() {
		
		this.DOM.btn.authorize.addEventListener('click', this.EVT.handleAuthClick);
		this.DOM.btn.signout.addEventListener('click', this.EVT.handleSignoutClick);

	}

	function evt_handleAuthClick() {
		
		console.log(this.MEM);
		
		if(!this.MEM.ready) {
			return;
		}
		
		gapi.auth2.getAuthInstance().signIn();

	}

	function evt_handleSignoutClick() {
		
		console.log(this.MEM);

		if(!this.MEM.ready) {
			return;
		}
		
		console.log('signout!!!');
		gapi.auth2.getAuthInstance().signOut();

	}

	function api_loadClient() {

		gapi.load('client:auth2', this.API.initClient)

	}

	async function api_initClient () {
		
		console.log('init client!!');

		try {
			await gapi.client.init(CREDENTIALS);
		} catch(err) {
			throw err;
		}

		console.log('init complete!!');

		this.MEM.ready = true;
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
			for(let key in this.MEM) {
				if(key === 'ready') {
					continue;
				}
				delete this.MEM[key];
			}
			this.DOM.btn.authorize.style.display = 'block';
			this.DOM.btn.signout.style.display = 'none';
		}

	}

	async function api_initFolder() {

		let query = {
			q : `name = 'whitmir.io' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
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
			this.MEM.parent = data.files[0].id;
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
		
			this.MEM.parent = JSON.parse(file.body).id;
		}
		
		this.API.initConfig();

	}

	// Ref: https://stackoverflow.com/questions/67326520/google-drive-api-creates-empty-untitled-file-with-browser-version/67327933#67327933

	async function api_initConfig() {

		let query = {
			q : `name = 'config.json' and parents in '${this.MEM.parent}' and trashed = false`
		}
		
		console.log(query);
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
		console.log(data);
		
		// If no config file is found, then we create one
		if(data.files.length === 0) {
		
			this.MEM.config = {
				categories : {},
				createdOn : Date.now()
			}
			
			let fileMetadata = {
				name : 'config.json',
				parents : [this.MEM.parent]
			}

			let media = {
				mimeType : 'application/vnd.google-apps.file',
				body : JSON.stringify(this.MEM.config)
			}
			
			const form = new FormData();
			form.append('metadata', new Blob([JSON.stringify(fileMetadata)], {type: 'application/json'}));
			form.append('file', new Blob([JSON.stringify(this.MEM.config)], {type: 'application/json'}));
			
			const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id';

			const opts = {
				method: 'POST',
				headers: new Headers({'Authorization': 'Bearer ' + gapi.auth.getToken().access_token}),
				body: form
			}
			try {
				res = await fetch(url, opts);
			} catch(err) {
				throw err;
			}

			res = await res.json();
			this.MEM.config.id = res.id;
			this.API.updateConfig();

		} else {
			
			console.log("Config file found!!!");

			let file = await gapi.client.drive.files.get({
				fileId: data.files[0].id,
				alt: 'media'
			})

			this.MEM.config = JSON.parse(file.body);
			
			console.log(this.MEM.config);
			if(!this.MEM.config.id) {
				this.MEM.config.id = data.files[0].id;
				this.API.updateConfig();
			}

		}

	}

	// Ref: https://stackoverflow.com/questions/40600725/google-drive-api-v3-javascript-update-file-contents
	async function api_updateConfig() {
	
		const url = `https://www.googleapis.com/upload/drive/v3/files/${this.MEM.config.id}?uploadType=media&`;

		const opts = {
			method: 'PATCH',
			headers: new Headers({'Authorization': 'Bearer ' + gapi.auth.getToken().access_token}),
			body: JSON.stringify(this.MEM.config, null, 2)
		}

		let res;

		try {
			res = await fetch(url, opts);
		} catch(err) {
			throw err;
		}

		res = await res.json();
		console.log(res);

	}


}).apply({});
