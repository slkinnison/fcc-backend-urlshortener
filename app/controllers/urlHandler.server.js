'use strict';

require('querystring');
var url = require('url');
var needle = require('needle');

var urlMap = {};
var reversedURLMap = {};

var persistURL = function (originalURL) {
    var short_url;
	if ( originalURL in reversedURLMap ) {
		short_url = reversedURLMap[originalURL];
	} else {
    	var tempCount = Object.keys(urlMap).length;
		var count = tempCount.toString(36);
		short_url = 'https://fcc-backend-urlshortener-slkinnison.c9users.io/api/' + count;
		urlMap[short_url] = originalURL;
		reversedURLMap[originalURL] = short_url;
	}
	var returnObj = {
		original_url : originalURL,
		short_url : short_url
	};
	return returnObj;
};

function URLHandler() {

	this.add = function (req, res) {
		var returnObj = {
			'error' : 'destination url is invalid'
		};

		if (req.url.indexOf("/api/new/") != 0) {
			res.sendStatus(404);
			res.end();
			return;
		}

		var original_url = req.url.substr("/api/new/".length);

		var originalUrlObj = url.parse(original_url, true);
		if (originalUrlObj.query.allow != 'true') {
			needle.get(original_url, function(error, response) {
				if (!error && response.statusCode == 200) {
        			returnObj = persistURL(original_url);
				}
    		    res.json(returnObj);
    		    return;
			});
		} else {
			// trim query string
			var trimmedUrl = original_url;
			
			trimmedUrl = trimmedUrl.replace('allow=true', '');
			trimmedUrl = trimmedUrl.replace('?&', '?');
			trimmedUrl = trimmedUrl.replace('&&', '&');
			if ( trimmedUrl.indexOf('?') === trimmedUrl.length - 1 ) {
				trimmedUrl = trimmedUrl.substring(0, trimmedUrl.length - 1)
			}
			if ( trimmedUrl.indexOf('&') === trimmedUrl.length - 1 ) {
				trimmedUrl = trimmedUrl.substring(0, trimmedUrl.length - 1)
			}
			console.log('Called persist for ' + trimmedUrl);
			returnObj = persistURL(trimmedUrl);
		    res.json(returnObj);
		    return;
		}

	};

	this.redirect = function (req, res) {
		var returnObj = {
			'error' : 'No short url found for given input'
		};
		var short_url = 'https://fcc-backend-urlshortener-slkinnison.c9users.io' + req.url;
		if ( short_url in urlMap ) {
			var original_url = urlMap[short_url];
			res.redirect(original_url);
			return;
		}
		res.json(returnObj);
	};
}

module.exports = URLHandler;
