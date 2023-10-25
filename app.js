/***************
 * node-unblocker: Web Proxy for evading firewalls and content filters,
 * similar to CGIProxy or PHProxy
 *
 *
 * This project is hosted on github:  https://github.com/nfriedly/nodeunblocker.com
 *
 * By Nathan Friedly - http://nfriedly.com
 * Released under the terms of the Affero GPL v3
 */

var url = require('url');
var querystring = require('querystring');
var express = require('express');
var Unblocker = require('unblocker');
var Transform = require('stream').Transform;
var youtube = require('unblocker/examples/youtube/youtube.js')

var app = express();

function editTitle(data) {
    if (data.contentType == 'text/html') {
        var myStream = new Transform({
            decodeStrings: false,
            function(chunk, encoding, next) {
                chunk = chunk.slice(0,chunk.search(/<title>/g)) + '<title>Cheddar Design' + chunk.slice(chunk.search(/<\/title>/g))
                this.push(chunk);
                next();
                }
        });
        data.stream = data.stream.pipe(myStream);
    }
}

var unblocker = new Unblocker({
    prefix: '/hdg/',
    requestMiddleware: [
        youtube.processRequest
    ],
    responseMiddleware: [
        
    ],
});

// this line must appear before any express.static calls (or anything else that sends responses)
app.use(unblocker);

// serve up static files *after* the proxy is run
app.use('/', express.static(__dirname + '/public'));

// this is for users who's form actually submitted due to JS being disabled or whatever
app.get("/no-js", function(req, res) {
    // grab the "url" parameter from the querystring
    var site = querystring.parse(url.parse(req.url).query).url;
    // and redirect the user to /proxy/url
    res.redirect(unblockerConfig.prefix + site);
});

app.listen(8080, function() {
    console.log(`node unblocker process listening at http://localhost:${port}/`);
}).on("upgrade", unblocker.onUpgrade); // onUpgrade handles websockets
