"use strict";

const CREDENTIALS = {
	clientId : '453824233916-gsihim23buhhslutm73b0p8iopqto428.apps.googleusercontent.com',
	apiKey : 'AIzaSyDPlArfI6m_vAH63knHzSk4dHylYxcQdPw',
	discoveryDocs : [
		'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
	],
	scope : [
		'https://www.googleapis.com/auth/drive.metadata.readonly'
	]
};

const Session = (function() {

	this.MEM = {
		ready : false
	}

	this.DOM = {
		btn : {
			authorize : document.getElementById('Session.btn.authorize'),
			signout : document.getElementById('Session.btn.signout')
		}.
		pre : {
			console : document.getElementById('Session.pre.console')
		}
	}
	
	this.EVT = {
		handleAuthClick : evt_handleAuthClick.bind(this).
		handleSignoutClick : evt_handleSignoutClick.bind(this)
	}

	this.API = {
		loadClient : api_loadClient.bind(this),
		initClient : api_initClient.bind(this)
	}

	init.apply(this);
	return this;

	function init() {

	}

	function evt_handleAuthClick() {
		
		if(!this.ready) {
			return;
		}

	}

	function evt_handleSignoutClick() {
		
		if(!this.ready) {
			return;
		}

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
		console.log('okay');

	}

}).apply({});
