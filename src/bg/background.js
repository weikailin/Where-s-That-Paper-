// created by Eylon Yogev.

browser.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
	if (changeInfo.status == 'complete'){
		try
		{
			console.log(changeInfo.status);
			HandleTab(tab);
		}
		catch(err){
			console.log(err);
		}
	}
});

var handlers = {};
browser.bookmarks.papersFolderId = '';
init();

function init(){
	handlers['eprint.iacr.org'] = ePrintScraper;
	handlers['arxiv.org'] = arxivScraper;
	handlers["eccc.weizmann.ac.il"] = ecccScraper;
	handlers['epubs.siam.org'] = siamScraper;
	handlers['research.microsoft.com'] = msrScraper;
	handlers['citeseerx.ist.psu.edu'] = citeseerxScraper;
	handlers['ac.els-cdn.com'] = sciencedirectScraper;
	handlers['www.sciencedirect.com'] = sciencedirectScraper;
	handlers['download.springer.com'] = springerScraper;
	handlers['link.springer.com'] = springerScraper;
	handlers['delivery.acm.org'] = acmScraper;
	handlers['proceedings.mlr.press'] = mlrScraper;
	handlers['journals.aps.org'] = apsScraper;
}


function HandleTab(tab){
	var url = tab.url;
	console.log(url);

	function onFulfilled(bookmarkItems){
		if(bookmarkItems.length > 0){
		  console.log("found in bookmarks");
		}
		else{
		  console.log("not found in bookmarks");
			try{
				var host = getHost(url);
				if (handlers[host] != null){
		  		console.log(host);
					handlers[host](tab, url);
				}
			}
			catch(err){
				console.log(err);
			}
		}
	}
	function onRejected(error){
		console.log(error);
	}
	var searching = browser.bookmarks.search(url);
	searching.then(onFulfilled, onRejected);
}

function getHost(url){
	var parser = document.createElement('a');
	parser.href = url;
	return parser.host;
}

function AddBookmarks(url, title, authors, year){
	var ref = '[' + getInitials(authors) + year.substr(2, 2) + ']';
	var fullTitle = ref + ' - ' + title + " - " + authors.join(' and ');
	
	getYearFolderId(year, function(id){
		AddBookmark(url, fullTitle, id);
	});
}


function getYearFolderId(year, callback){
	getPapersFolderId(function(id){
		chrome.bookmarks.getChildren(id, function(children){
			var found = false;
			children.forEach(element => {
				if (element.title == year){
					callback(element.id);
					found = true;
					return;
				}
			});
			if (!found){
				chrome.bookmarks.create({
					'parentId': id,
					'title': year},
					function(newfolder){
						callback(newfolder.id);
					});
			}
		});
	});
}

function getPapersFolderId(callback){
	console.log('new');
	if (browser.bookmarks.papersFolderId != ''){
		callback(browser.bookmarks.papersFolderId);
		return;
	}

	function onFulfilled(bookmarkItems){
		console.log(bookmarkItems);
		var found = false;
		for (var i = 0; i < bookmarkItems.length; i++){
			if (bookmarkItems[i].title == "Papers"){
				found = true;
				browser.bookmarks.papersFolderId = bookmarkItems[i].id;
				callback(browser.bookmarks.papersFolderId);
				break;
			}
		}
		if (!found){
			browser.bookmarks.create({
				// 'parentId': '1',
				'title': 'Papers'}).then(function(newfolder){
					browser.bookmarks.papersFolderId = newfolder.id;
					console.log(newfolder);
					callback(browser.bookmarks.papersFolderId);
			});
		}
	}
	function onRejected(error){
		console.log(error);
	}
	var searching = browser.bookmarks.search("Papers");
	searching.then(onFulfilled, onRejected);
}


function AddBookmark(url, title, folderId){
	chrome.bookmarks.getChildren(folderId, function(children) {
		var found = false;
		children.forEach(function(bookmark) { 
			if (bookmark.url == url)
				found = true;
		});
		if (!found){
			chrome.bookmarks.create({
				'parentId': folderId,
				'title': title,
				'url': url,
				'index': 0}
			);
		}
	});
}