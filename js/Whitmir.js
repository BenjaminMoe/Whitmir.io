"use strict";

const CREDENTIALS = {
	apiKey : 'AIzaSyDPlArfI6m_vAH63knHzSk4dHylYxcQdPw',
	clientId : '453824233916-gsihim23buhhslutm73b0p8iopqto428.apps.googleusercontent.com',
	discoveryDocs : [
		'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
	],
	scope : [
		'https://www.googleapis.com/auth/drive',
		'https://www.googleapis.com/auth/drive.file',
		'https://www.googleapis.com/auth/drive.appdata',
		'https://www.googleapis.com/auth/drive.scripts',
		'https://www.googleapis.com/auth/drive.metadata'
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
		settings : {
			toggle : document.getElementById('Whitmir.settings.toggle'),
			menu : document.getElementById('Whitmir.settings.menu')
		},
		books : {
			create : document.getElementById('Whitmir.books.create'),
			list : document.getElementById('Whitmir.books.list')
		},
		chapter : {
			create : document.getElementById('Whitmir.chapter.create'),
			list : document.getElementById('Whitmir.chapter.list')
		},
		editor : {
			quill : document.getElementById('Whitmir.editor.quill'),
			save : document.getElementById('Whitmir.editor.save'),
			undo : document.getElementById('Whitmir.editor.undo'),
			redo : document.getElementById('Whitmir.editor.redo'),
		},
		mode : {
			toggle : document.getElementById('Whitmir.mode.toggle'),
			menu : document.getElementById('Whitmir.mode.menu'),
			html : document.getElementById('Whitmir.mode.html'),
			richtext : document.getElementById('Whitmir.mode.richtext'),
			json : document.getElementById('Whitmir.mode.json'),
			markdown : document.getElementById('Whitmir.mode.markdown')
		}
	}
	
	this.EVT = {
		handleSigninClick : evt_handleSigninClick.bind(this),
		handleSignoutClick : evt_handleSignoutClick.bind(this),
		handleProfileToggleClick : evt_handleProfileToggleClick.bind(this),
		handleSettingsToggleClick : evt_handleSettingsToggleClick.bind(this),
		handleExportToggleClick : evt_handleExportToggleClick.bind(this),
		handleCategoryToggleClick : evt_handleCategoryToggleClick.bind(this),
		handleCategoryAddClick : evt_handleCategoryAddClick.bind(this),
		handleCreateBook : evt_handleCreateBook.bind(this),
		handleBookClick : evt_handleBookClick.bind(this),
		handleCreateChapter : evt_handleCreateChapter.bind(this),
		handleChapterClick : evt_handleChapterClick.bind(this),

		handleModeToggleClick : evt_handleModeToggleClick.bind(this),

		// Toolbar Events

		handleSaveClick : evt_handleSaveClick.bind(this),
		handleUndoClick : evt_handleUndoClick.bind(this),
		handleRedoClick : evt_handleRedoClick.bind(this),
		
		handleDragEnter : evt_handleDragEnter.bind(this),
		handleDragLeave : evt_handleDragLeave.bind(this),
		handleDragOver : evt_handleDragOver.bind(this),
		handleDrop : evt_handleDrop.bind(this),

	}

	this.API = {
		loadClient : api_loadClient.bind(this),
		initClient : api_initClient.bind(this),
		updateSigninStatus : api_updateSigninStatus.bind(this),
		initFolder : api_initFolder.bind(this),
		initConfig : api_initConfig.bind(this),
		updateConfig : api_updateConfig.bind(this),
		renderCategories : api_renderCategories.bind(this),
		renderBooks : api_renderBooks.bind(this),
		renderChapter : api_renderChapter.bind(this),
		openChapter : api_openChapter.bind(this),
		updateChapter : api_updateChapter.bind(this),
		implementSave : api_implementSave.bind(this)
	}

	init.apply(this);
	return this;

	function init() {
	
		this.API.loadClient();

		// Reset Toolbar
		
		this.MEM.tiny = tinymce.init({
      		selector: '#mytextarea',
			menubar: false,
			/*
			toolbar : 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | outdent indent code',
			toolbar_sticky : true,
			*/
			toolbar : false,
			statusbar : false,
			plugins: 'spellchecker autoresize code',
			content_css : 'css/myLayout.css',
			content_style: "body {padding: 0px; margin : 0px;} p { margin-bottom: 30px; }"
    	});

		// Book and Chapter events

		this.DOM.session.signin.addEventListener('click', this.EVT.handleSigninClick);
		this.DOM.session.signout.addEventListener('click', this.EVT.handleSignoutClick);
		this.DOM.profile.toggle.addEventListener('click', this.EVT.handleProfileToggleClick);
		this.DOM.settings.toggle.addEventListener('click', this.EVT.handleSettingsToggleClick);
		
		this.DOM.mode.toggle.addEventListener('click', this.EVT.handleModeToggleClick);
		//this.DOM.export.toggle.addEventListener('click', this.EVT.handleExportToggleClick);
		
		this.DOM.category.toggle.addEventListener('click', this.EVT.handleCategoryToggleClick);
		this.DOM.category.add.addEventListener('click', this.EVT.handleCategoryAddClick);
		this.DOM.books.create.addEventListener('click', this.EVT.handleCreateBook);
		this.DOM.chapter.create.addEventListener('click', this.EVT.handleCreateChapter);

		// Toolbar Events

		this.DOM.editor.save.addEventListener('click', this.EVT.handleSaveClick);
		this.DOM.editor.undo.addEventListener('click', this.EVT.handleUndoClick);
		this.DOM.editor.redo.addEventListener('click', this.EVT.handleRedoClick);
		
		// Drag and Drop Events
	
		this.DOM.editor.quill.addEventListener('dragenter', this.EVT.handleDragEnter);
		this.DOM.editor.quill.addEventListener('dragleave', this.EVT.handleDragLeave);
		this.DOM.editor.quill.addEventListener('dragover', this.EVT.handleDragOver);
		this.DOM.editor.quill.addEventListener('drop', this.EVT.handleDrop);
	
	}

	function evt_handleSettingsToggleClick() {

		this.DOM.settings.menu.classList.toggle('hide');

	}

	function evt_handleModeToggleClick() {

		this.DOM.mode.menu.classList.toggle('hide');

	}

	function evt_handleDragEnter(evt) {
		
		console.log('drag enter!!');

	}

	function evt_handleDragLeave(evt) {

		console.log('drga leave!!');

	}

	function evt_handleDragOver(evt) {

		console.log('drag over!!');

	}

	function evt_handleDrop(evt) {

		console.log('drop!!!');

	}

	async function api_implementSave() {
		
		let body = tinymce.activeEditor.getContent()
		console.log(this.MEM.chapter);
		
		let id = this.MEM.chapter.id;
		const metaData = {
			fileId : id
		}

		const form = new FormData();
		
		const mime = {type: 'application/json'};
		form.append('metadata', new Blob([JSON.stringify(metaData)], mime));
		form.append('file', new Blob([body], mime));
		
		const url = `https://www.googleapis.com/upload/drive/v3/files/${id}?uploadType=multipart`;

		const opts = {
			method: 'PATCH',
			headers: new Headers({'Authorization': 'Bearer ' + gapi.auth.getToken().access_token}),
			body : form
		}

		let res;

		try {
			res = await fetch(url, opts);
		} catch(err) {
			throw err;
		}

		res = await res.json();

	}
	
	function evt_handleRedoClick() {
		
		this.MEM.quill.history.redo();

	}
	
	function evt_handleUndoClick() {
		
		this.MEM.quill.history.undo();

	}

	function evt_handleSaveClick() {

		console.log('handle save click');
		
		this.API.implementSave();

	}

	async function evt_handleChapterClick(evt) {

		let elem = evt.target;
		while(elem.parentNode && elem.tagName !== 'LI') {
			elem = elem.parentNode;
		}

		let userData = elem.userData;
		if(!userData) {
			return;
		}

		if(this.MEM.activeChapter) {
			this.MEM.activeChapter.classList.remove('active');
		}
		
		this.MEM.activeChapter = elem;
		this.MEM.activeChapter.classList.add('active');
		this.MEM.chapter = userData;

		let query = {
			fileId : this.MEM.chapter.id,
			alt : 'media'
		};

		let res;
		try {
			res = await gapi.client.drive.files.get(query);
		} catch(err) {
			throw err;
		}
		
		//let contents = JSON.parse(res.body);
		tinymce.activeEditor.setContent(res.body);

	}

	function api_openChapter() {

		console.log('open the chapter');

	}

	function api_updateChapter() {
	
		console.log('now we update the chapter');
	
	}

	async function evt_handleCreateChapter() {

		console.log('create chapter!!!');
			
		if(!this.MEM.book) {
			return;
		}

		// Right now, be lazy and just get a name
	
		let name = prompt('Give your chapter a name!');
		if(!name) {
			return;
		}

		// Then we go ahead and create an html file
		
		let chapter = {
			name : name,
			createdOn : Date.now()
		}
			
		let fileMetadata = {
			name : name,
			parents : [this.MEM.book.folder]
		}

		let media = {
			mimeType : 'application/vnd.google-apps.file',
			body : JSON.stringify(this.MEM.config)
		}
			
		const mime = {type: 'application/json'};
		const form = new FormData();

		form.append('metadata', new Blob([JSON.stringify(fileMetadata)], mime));
		form.append('file', new Blob(['[]'], mim));
			
		const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id';

		const opts = {
			method: 'POST',
			headers: new Headers({'Authorization': 'Bearer ' + gapi.auth.getToken().access_token}),
			body: form
		}

		let res;
		try {
			res = await fetch(url, opts);
		} catch(err) {
			throw err;
		}
		
		res = await res.json();
		chapter.id = res.id;
		this.API.openChapter(chapter);

		this.MEM.book.chapters.push(chapter);
		this.API.renderChapter();
		this.API.updateConfig();


	}

	function api_renderChapter() {

		console.log('render chapters!!!');

		this.DOM.chapter.list.innerHTML = '';

		this.MEM.book.chapters.forEach( chapter => {
			
			let li = document.createElement('li');
			li.textContent = chapter.name;
			this.DOM.chapter.list.appendChild(li);
			li.userData = chapter;
			li.addEventListener('click', this.EVT.handleChapterClick);

		});

	}

	function evt_handleBookClick(evt) {

		let elem = evt.target;
		while(elem.parentNode && elem.tagName !== 'LI') {
			elem = elem.parentNode;
		}

		let userData = elem.userData;
		if(!userData) {
			return;
		}

		if(this.MEM.activeBook) {
			this.MEM.activeBook.classList.remove('active');
		}
		
		this.MEM.activeBook = elem;
		this.MEM.activeBook.classList.add('active');
		this.MEM.book = userData;
		
		this.API.renderChapter();

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
			li.userData = book;
			li.addEventListener('click', this.EVT.handleBookClick);
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
				li.userData = book;
				li.addEventListener('click', this.EVT.handleBookClick);
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
			
			for(let key in this.MEM) {
				switch(key) {
				case 'quill':
					break;
				case 'bold':
				case 'italic':
				case 'underline':
				case 'strikethrough':
					this.MEM[key] = false;
					break;
				default:
					delete this.MEM[key];
					break;
				}
			}

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
