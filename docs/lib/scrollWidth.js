(function() {

	let width = getScrollbarWidth();
	let sheets = document.styleSheets;
	
	let sheet;
	for(let i = 0; i < sheets.length; i++) {
		sheet = sheets[i];
		if(sheet.href.indexOf('layout.css') === -1){
			continue;
		}
		break;
	}

	if(!sheet) {
		return;
	}
	
	sheet.insertRule(`:root { --scroll-width : ${width}px; }`);
	console.log(sheet);

	function getScrollbarWidth() {

		// Creating invisible container
		const outer = document.createElement('div');
		outer.style.visibility = 'hidden';
		outer.style.overflow = 'scroll'; // forcing scrollbar to appear
		outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
		document.body.appendChild(outer);

		// Creating inner element and placing it in the container
		const inner = document.createElement('div');
		outer.appendChild(inner);

		// Calculating difference between container's full width and the child width
		const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

		// Removing temporary elements from the DOM
		outer.parentNode.removeChild(outer);

		return scrollbarWidth;

	}

})();
