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

const Whitmir = (function() {

	this.MEM = {
		ready : false
	}

	this.DOM = {
		session : {
			signin : document.getElementById('Whitmir.session.signin'),
			signout : document.getElementById('Whitmir.session.signout')
		},
		profile : {
			toggle : document.getElementById('Whitmir.profile.toggle'),
			menu : document.getElementById('Whitmir.profile.menu'),
			name : document.getElementById('Whitmir.profile.name'),
			email : document.getElementById('Whitmir.profile.email'),
		},
		export : {
			widget : document.getElementById('Whitmir.export.widget'),
			trigger : document.getElementById('Whitmir.export.trigger'),
			toggle : document.getElementById('Whitmir.export.toggle'),
			menu : document.getElementById('Whitmir.export.menu'),
		},
		category : {
			toggle : document.getElementById('Whitmir.category.toggle'),
			menu : document.getElementById('Whitmir.category.menu'),
			list : document.getElementById('Whitmir.category.list'),
			add : document.getElementById('Whitmir.category.add'),
			input : document.getElementById('Whitmir.category.input')
		},
		books : {
			create : document.getElementById('Whitmir.books.create'),
			list : document.getElementById('Whitmir.books.list')
		}
	}
	
	this.EVT = {
		handleSigninClick : evt_handleSigninClick.bind(this),
		handleSignoutClick : evt_handleSignoutClick.bind(this),
		handleProfileToggleClick : evt_handleProfileToggleClick.bind(this),
		handleExportToggleClick : evt_handleExportToggleClick.bind(this),
		handleCategoryToggleClick : evt_handleCategoryToggleClick.bind(this),
		handleCategoryAddClick : evt_handleCategoryAddClick.bind(this),
		handleCreateBook : evt_handleCreateBook.bind(this)
	}

	this.API = {
		loadClient : api_loadClient.bind(this),
		initClient : api_initClient.bind(this),
		updateSigninStatus : api_updateSigninStatus.bind(this),
		initFolder : api_initFolder.bind(this),
		initConfig : api_initConfig.bind(this),
		updateConfig : api_updateConfig.bind(this),
		renderCategories : api_renderCategories.bind(this),
		renderBooks : api_renderBooks.bind(this)
	}

	init.apply(this);
	return this;

	function init() {
	
		this.API.loadClient();

		this.DOM.session.signin.addEventListener('click', this.EVT.handleSigninClick);
		this.DOM.session.signout.addEventListener('click', this.EVT.handleSignoutClick);
		this.DOM.profile.toggle.addEventListener('click', this.EVT.handleProfileToggleClick);
		this.DOM.export.toggle.addEventListener('click', this.EVT.handleExportToggleClick);
		this.DOM.category.toggle.addEventListener('click', this.EVT.handleCategoryToggleClick);
		this.DOM.category.add.addEventListener('click', this.EVT.handleCategoryAddClick);
		this.DOM.books.create.addEventListener('click', this.EVT.handleCreateBook);

	}

	function api_renderBooks() {

		console.log('render da books!!');
		
		this.DOM.books.list.innerHTML = '';
			
		if(this.MEM.config.unsorted.length) {
			let h4 = document.createElement('h4');
			this.DOM.books.list.appendChild(h4);
		}
		
		this.MEM.config.unsorted.forEach( book => {
			let li = document.createElement('li');
			let node = document.createTextNode(book.name);
			let icon = document.createElement('i');
			icon.setAttribute('class', book.icon);
			li.appendChild(icon);
			li.appendChild(node);
			this.DOM.books.list.appendChild(li);

		});
		
		for(let key in this.MEM.config.categories) {
			
			let h4 = document.createElement('h4');
			h4.textContent = key;
			this.DOM.books.list.appendChild(h4);

			this.MEM.config.categories[key].forEach( book => {
				let li = document.createElement('li');
				let node = document.createTextNode(book.name);
				let icon = document.createElement('i');
				icon.setAttribute('class', book.icon);
				li.appendChild(icon);
				li.appendChild(node);
				this.DOM.books.list.appendChild(li);
			});

		}

	}

	async function evt_handleCreateBook() {

		let name = prompt('Please give your book a title');
		name = name.trim();
		
		// Do some basic sanity checks

		if(!name) {
			return;
		}

		if(!name.length) {
			return alert('No title was entered');
		}

		let stripped = name.replace(/\s+/g, '');
		if(!stripped.length) {
			return alert('Book title cannot be only white space');
		}
		
		// Check if the name exists

		let found = false;
		let lower = name.toLowerCase();

		for(let i = 0; i < this.MEM.config.unsorted.length; i++) {
			if(this.MEM.config.unsorted[i].name.toLowerCase() !== name) {
				continue;
			}
			found = true;
			break;
		}

		for(let key in this.MEM.config.categories) {
			if(found) {
				break;
			}
			for(let i = 0; i < this.MEM.config.categories[key].length; i++) {
				if(this.MEM.config.categories[key][i].name.toLowerCase() !== name) {
					continue;
				}
				found = true;
				break;
			}
		}

		if(found) {
			return alert('Book title is already in use.');
		}

		// If name doesn't exist create a folder

		let fileMetadata = {
			name : name,
			mimeType : 'application/vnd.google-apps.folder',
			parents : [ this.MEM.parent ]
		}
		
		let query = {
			resource : fileMetadata,
			fields : 'id'
		}

		let res;
		try {
			res = await gapi.client.drive.files.create(query);
		} catch(err) {
			throw err;
		}
		
		let data = JSON.parse(res.body);
		let book = {
			name : name,
			folder : data.id,
			chapters : [],
			createdOn : Date.now(),
			icon : 'fas fa-book'
		}

		this.MEM.config.unsorted.push(book);
		this.API.updateConfig();
		this.API.renderBooks();

	}

	function api_renderCategories() {

		this.DOM.category.list.innerHTML = '';
		for(let key in this.MEM.config.categories) {
			let li = document.createElement('li');
			let node = document.createTextNode(key);
			let btn = document.createElement('div');
			btn.setAttribute('class', 'btn');
			let i = document.createElement('i');
			i.setAttribute('class', 'fas fa-times');

			li.appendChild(node);
			li.appendChild(btn);
			btn.appendChild(i);
			this.DOM.category.list.appendChild(li);

		}

	}

	function evt_handleCategoryAddClick(){
		
		let str = this.DOM.category.input.value;
		if(!str.length) {
			return alert('Please give the category a name');
		}

		let stripped = str.replace(/\s+/g, '');
		if(!stripped.length) {
			return alert('Please category name cannot be only white space');
		}

		if(str in this.MEM.config.categories) {
			return alert('Category name already exists');
		}

		this.MEM.config.categories[str] = [];
		this.API.updateConfig();
		this.API.renderCategories();
		this.DOM.category.input.value = '';
	}

	function evt_handleCategoryToggleClick() {

		this.DOM.category.menu.classList.toggle('open');

	}

	function evt_handleExportToggleClick() {
		
		this.DOM.export.menu.classList.toggle('hide');
		this.DOM.profile.menu.classList.add('hide');

	}

	function evt_handleProfileToggleClick() {
		
		this.DOM.profile.menu.classList.toggle('hide');
		this.DOM.export.menu.classList.add('hide');

	}

	function evt_handleSigninClick() {
		
		if(!window.gapi) {
			return;
		}
		
		gapi.auth2.getAuthInstance().signIn();

	}

	function evt_handleSignoutClick() {
		
		if(!window.gapi) {
			return;
		}
		
		gapi.auth2.getAuthInstance().signOut();
		
		this.DOM.profile.menu.classList.add('hide');
		this.DOM.export.menu.classList.add('hide');

	}

	function api_loadClient() {
		
		if(!window.gapi) {
			return setTimeout(this.API.loadClient, 10);
		}

		gapi.load('client:auth2', this.API.initClient)

	}

	async function api_initClient () {
		
		console.log('init client!!');

		try {
			await gapi.client.init(CREDENTIALS);
		} catch(err) {
			throw err;
		}

		let isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
		this.API.updateSigninStatus(isSignedIn);
		gapi.auth2.getAuthInstance().isSignedIn.listen(this.API.updateSigninStatus);

	}

	function api_updateSigninStatus(isSignedIn) {
		
		if(isSignedIn) {

			this.API.initFolder();
			
			let profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
			let img = profile.getImageUrl();
			this.DOM.profile.toggle.style.backgroundImage = `url(${img})`;
			this.DOM.profile.name.textContent = profile.getName();
			this.DOM.profile.email.textContent = profile.getEmail();

			this.DOM.session.signin.classList.add('hide');
			this.DOM.profile.toggle.classList.remove('hide');
			this.DOM.export.widget.classList.remove('hide');
		
		} else {
			
			this.MEM = {}

			this.DOM.session.signin.classList.remove('hide');
			this.DOM.profile.toggle.classList.add('hide');
			this.DOM.export.widget.classList.add('hide');

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
				unsorted : [],
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
			
			let config_str = JSON.stringify(this.MEM.config, null, 2);
			const mime = {type: 'application/json'};
			const form = new FormData();

			form.append('metadata', new Blob([JSON.stringify(fileMetadata)], mime));
			form.append('file', new Blob([config_str], mime));
			
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
		
		this.API.renderCategories();
		this.API.renderBooks();

	}

	// Ref: https://stackoverflow.com/questions/40600725/google-drive-api-v3-javascript-update-file-contents
	async function api_updateConfig() {
	
		const url = `https://www.googleapis.com/upload/drive/v3/files/${this.MEM.config.id}?uploadType=media&`;

		this.MEM.config.updatedOn = Date.now();

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
