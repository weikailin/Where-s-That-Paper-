
function bibtexParser(url, pageUrl, options={}){
	getUrl(pageUrl, function(req){
		var bibentry = req.responseText;
		var months = '@STRING{ jan = "January" }\
@STRING{ feb = "February" }\
@STRING{ mar = "March" }\
@STRING{ apr = "April" }\
@STRING{ may = "May" }\
@STRING{ jun = "June" }\
@STRING{ jul = "July" }\
@STRING{ aug = "August" }\
@STRING{ sep = "September" }\
@STRING{ oct = "October" }\
@STRING{ nov = "November" }\
@STRING{ dec = "December" }\
';
		bibentry = months + bibentry;
		bibtexParserString(url, bibentry, options);
	});
}

function bibtexParserString(url, bibtexString, options={}){
	if (options == null)
		options = {};
	
	if (options['titleName'] == null)
		options['titleName'] = 'title';
	if (options['authorsName'] == null)
		options['authorsName'] = 'author';
	if (options['yearName'] == null)
		options['yearName'] = 'year';
	
	if (options['callback'] == null)
		options['callback'] = AddBookmarks;
	
	var data = parseBibFile(bibtexString);
	var key = Object.keys(data.entries$)[0];
	var entry = data.entries$[key];
	
	var title = entry.getFieldAsString('Title');
	var authorField = entry.getField("author");

	var authors = [];
	authorField.authors$.map((author, i) => 
		authors.push(author.firstNames + ' ' + author.lastNames)
	);
	
	var year = entry.getFieldAsString('Year');
	options['callback'](url, title, authors, year);
}

function metaGetter(dom, metaNames){
	var ret = [];
	for (var i = 0; i < metaNames.length; i++){
		ret.push(getElementByName(dom, 'meta', metaNames[i]));
	}
	return ret;
}

function metaParser(url, pageUrl, options={}){
	if (options == null)
		options = {};
	
	if (options['titleName'] == null)
		options['titleName'] = 'citation_title';
	if (options['authorsName'] == null)
		options['authorsName'] = 'citation_author';
	if (options['yearName'] == null)
		options['yearName'] = 'citation_date';
	
	if (options['callback'] == null)
		options['callback'] = AddBookmarks;
	
	getDom(pageUrl, function(dom){
		var metaTags = metaGetter(dom, [
			options['titleName'], options['authorsName'], options['yearName']
		]);
		var title = metaTags[0][0].content;
		var authorsHtml = metaTags[1];
		var authors = [];
		for (var i = 0; i < authorsHtml.length; i++){
			if (!authors.includes(authorsHtml[i]))
				authors.push(authorsHtml[i].content);
		}
		
		var year = metaTags[2][0].content.substr(0,4);
		
		options['callback'](url, title, authors, year);
	});
}

function authorFirstLast(author){
	// 'Last, First' to 'First Last'
	return author.split(', ')[1] + ' ' + author.split(', ')[0];
}

function ePrintScraper(tab, url){
	if (!url.endsWith('.pdf'))
		return;
	
	var pageUrl = url.substr(0, url.length-4);

	metaParser(url, pageUrl, {'yearName': 'citation_publication_date'});
	// getDom(pageUrl, function(dom){
	// 	var title = cleanSpaces(dom.getElementsByTagName('b')[0].innerText);
	// 	var authorsStr = cleanSpaces(dom.getElementsByTagName('i')[0].innerText);
	// 	var authors = authorsStr.split(" and ");
	// 	var year = url.split('/')[3];
		
	// 	AddBookmarks(url, title, authors, year);
	// });
}

function arxivScraper(tab, url){
	if (!url.endsWith('.pdf'))
		return;
	
	var pageUrl = url.replace('/pdf/','/abs/');
	metaParser(url, pageUrl, {'callback': function(url, title, authors, year){
		for(var i = 0; i < authors.length; i++){
			authors[i] = authorFirstLast(authors[i]);
		}
		AddBookmarks(url, title, authors, year);
	}});
}

function coreScraper(tab, url){
	if (!url.endsWith('.pdf'))
		return;
	var id = getLastPart(url, '/');
	id = getPartFromEnd(id, '.', 1);
	var pageUrl = 'https://core.ac.uk/display/' + id;
	metaParser(url, pageUrl, {
		'yearName': 'citation_publication_date',
		'callback': function(url, title, authors, year){
			for(var i = 0; i < authors.length; i++){
				authors[i] = authorFirstLast(authors[i]);
			}
			AddBookmarks(url, title, authors, year);
	}});
}

function ecccScraper(tab, url){
	if (url.indexOf('/report/') == -1)
		return;
	
	getDom(url, function(dom){
		var title = dom.getElementsByTagName('h4')[0].innerText;
		var authorsHtml = getElementWithHref(dom, '/author/');
		var authors = [];
		for (var i = 0; i < authorsHtml.length; i++){
			var name = authorsHtml[i].text;
			if (!authors.includes(name))
				authors.push(name);
		}
		
		var year = dom.getElementsByTagName('u')[0].innerText.split('|')[1].split(' ')[3];
		
		AddBookmarks(url, title, authors, year);
	});
}

function siamScraper(tab, url){
	if (url.indexOf('/pdf/') == -1)
		return;
	
	var id = url.split('/pdf/')[1];
	var pageUrl = 'https://epubs.siam.org/action/downloadCitation?format=bibtex&doi=[ID]';
	pageUrl = pageUrl.replace('[ID]', id);
	// WORKAROUND: SIAM doen't include "year" in bibtex,
	// remove callback if it's fixed.
	bibtexParser(url, pageUrl, {'callback': function(url, title, authors, year){
		if(year){
			AddBookmarks(url, title, authors, year);
		}
		else{
			var pageUrl ='https://epubs.siam.org/action/showCitFormats?doi=[ID]';
			pageUrl = pageUrl.replace('[ID]', id);
 			getDom(pageUrl, function(dom){
				year = dom.querySelector('span.year').innerText;
				AddBookmarks(url, title, authors, year);
			});
		}
	}});
}

function msrScraper(tab, url){
	if (!url.endsWith('.pdf'))
		return;
	var id = getPartFromEnd(url, '/', 1);
	var pageUrl = 'http://research.microsoft.com/apps/pubs/default.aspx?id=' + id;
	getDom(url, pageUrl, function(dom){
		var div = getElementByTagAndId(dom, 'div', 'pubDeTop');
		var title = div.children[0].innerText;
		var parts = div.children[1].innerText.split('\n');
		var authors = parts[0].replace(', and ',', ').replace(' and ',', ').split(', ');
		var year = getLastPart(parts[1], ' ');
		
		AddBookmarks(url, title, authors, year);
	});
}

function citeseerxScraper(tab, url){
	if (!url.endsWith('type=pdf'))
		return;
	var i = url.indexOf('doi=') + 4;
	var j = url.indexOf('&', i);
	var id = url.substr(i,j-i);
	var pageUrl = 'http://citeseerx.ist.psu.edu/viewdoc/summary?doi=' + id;
	
	metaParser(url, pageUrl, {
		'yearName': 'citation_year', 
		'authorsName': 'citation_authors',
		'callback': function(url, title, authors, year){
			var authors = authors[0].split(', ');
			AddBookmarks(url, title, authors, year);
		}
	});
}

function sciencedirectScraper(tab, url){
	if (url.indexOf('main.pdf') == -1)
		return;
	//console.log('science');
	var id = '';
	if (url.indexOf('sciencedirectassets.com') == -1){
		id = url.split('/')[6];
	}
	else{
		var i = url.indexOf('pii=') + 4;
		var j = url.indexOf('&', i);
		id = url.substr(i,j-i);
	}
	// [TODO] sciencedirect pages have a meta tag "citation_pdf_url" 
	// (but no author tag)
	var pageUrl = 'https://www.sciencedirect.com/sdfe/arp/cite?pii=[ID]&format=text/x-bibtex&withabstract=false';
	pageUrl = pageUrl.replace('[ID]', id);
	url = 'https://www.sciencedirect.com/science/article/pii/' + id;
	bibtexParser(url, pageUrl);
}

function elsevierScraper(tab, url){
	// [DIRTY] chopping "reader.elsevier.com/....?token="
	// [DIRTY] and circumvent "main.pdf" checking 
	url = url.replace('?', '/main.pdf');
	sciencedirectScraper(tab, url);
}

function springerScraper(tab, url){
	if (url.indexOf('.pdf') == -1)
		return;
	url = decodeURIComponent(url);
	var index = url.indexOf('.pdf');
	var index2 = url.indexOf('10.');
	var id = url.substr(index2, index-index2);
	var pageUrl = 'http://citation-needed.services.springer.com/v2/references/[ID]?format=bibtex&flavour=citation';
	pageUrl = pageUrl.replace('[ID]', id);
	bibtexParser(url, pageUrl);
}

function acmScraper(tab, url){
	if (url.indexOf('.pdf') == -1)
		return;
	
	var id = url.split('/')[5];
	var pageUrl = 'https://dl.acm.org/citation.cfm?id=' + id;
	getDom(pageUrl, function(dom){
		var metaTags = metaGetter(dom, ['citation_title', 'citation_authors', 'citation_date', 'citation_pdf_url']);
		var title = metaTags[0][0].content;
		var authorsHtml = metaTags[1][0].content;
		var authors = authorsHtml.split('; ');
		for(var i = 0; i < authors.length; i++){
			authors[i] = authorFirstLast(authors[i]);
		}
		var year = metaTags[2][0].content.split('/')[2];
		url = metaTags[3][0].content;
		AddBookmarks(url, title, authors, year);
	});
}

function mlrScraper(tab, url){
	if (url.indexOf('.pdf') == -1)
		return;
	
	var pageUrl = url.replace('.pdf', '.html');
	getUrl(pageUrl, function(req){
		// [DIRTY] to cleanup with getDom()
		var parser = new DOMParser ();
		var responseDoc = parser.parseFromString (req.responseText, "text/html");
		var bibtexString = responseDoc.getElementById('bibtex').innerHTML;
		console.log(bibtexString);
		bibtexParserString(url, bibtexString);
	});
}

function apsScraper(tab, url){
	if (url.indexOf('/pdf/') == -1)
		return;
	//console.log('science');
	var pageUrl =  url.replace('/pdf/', '/export/');
	bibtexParser(url, pageUrl);
}

function dropsScraper(tab, url){
	if (url.indexOf('/pdf/') == -1)
		return;

	var pageUrl = url.substr(0, url.indexOf('/pdf/') + 1);
	// copied from arxivScraper
	metaParser(url, pageUrl, {'callback': function(url, title, authors, year){
		for(var i = 0; i < authors.length; i++){
			authors[i] = authorFirstLast(authors[i]);
		}
		AddBookmarks(url, title, authors, year);
	}});
}


//////////////////////////////////////////////////////

function getUrl(url, callback){
	var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (req.status == 200) {
				callback(req);
            }
          }
        };
	req.send();
}

function getDom(pageUrl, callback){
	getUrl(pageUrl, function(req){
		var dom = new DOMParser().parseFromString(req.responseText, 'text/html');
		callback(dom);
	});
}



function cleanSpaces(text){
	return text.replace(/ +(?= )/g,'');
}

function getInitials(authors){
	if (authors.length == 1){
		var lastName = getLastPart(authors[0], ' ');
		if (lastName.length >= 3)
			return lastName.substring(0,3);
		else
			return lastName;
	}
	
	var str = '';
	for (i = 0; i < authors.length; i++){
		var parts = authors[i].split(' ');
		var last = parts[parts.length-1];
		var letter = last.substring(0,1);
		str += letter;
	}
	return str;
}

function getLastPart(str, del){
	var parts = str.split(del);
	return parts[parts.length-1];
}

function getPartFromEnd(str, del, num){
	var parts = str.split(del);
	return parts[parts.length-1-num];
}

function getElementByName(dom, tag, name){
	var els = dom.getElementsByTagName(tag);
	var res = [];
	for (var i = 0; i < els.length; i++){
		if (els[i].name == name){
			res.push(els[i]);
		}
	}
	return res;
}

function getElementWithHref(dom, name){
	var els = dom.getElementsByTagName('a');
	var res = [];
	for (var i = 0; i < els.length; i++){
		if (els[i].href.indexOf(name) != -1){
			
			res.push(els[i]);
		}
	}
	return res;
}

function getElementByTagAndId(dom, tag, id){
	var els = dom.getElementsByTagName(tag);
	
	for (var i = 0; i < els.length; i++){
		if (els[i].id == id){
			return els[i];
		}
	}
	return null;
}