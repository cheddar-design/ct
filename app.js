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

var url = require("url");
var querystring = require("querystring");
var express = require("express");
var Unblocker = require("unblocker");
var Transform = require("stream").Transform;
var youtube = require("unblocker/examples/youtube/youtube.js");

const replaceSnippet = require("./snippet.js");

var app = express();

var unblocker = new Unblocker({
  prefix: "/hdg/",
  requestMiddleware: [youtube.processRequest],
  responseMiddleware: [
    replaceSnippet({
      processContentTypes: ["text/html"],
      searchFor: /<title>.*<\/title>/i,
      replaceWith: "<title>Hello</title>",
    }),
    replaceSnippet({
      processContentTypes: ["text/html"],
      searchFor: /<link rel="shortcut icon".*>/i,
      replaceWith:
        '<link rel="shortcut icon" href="https://simplebits.com/apple-touch-icon.png">',
    }),
  ],
});

// this line must appear before any express.static calls (or anything else that sends responses)
app.use(unblocker);

// serve up static files *after* the proxy is run
app.use("/", express.static(__dirname + "/public"));

// this is for users who's form actually submitted due to JS being disabled or whatever
app.get("/no-js", function (req, res) {
  // grab the "url" parameter from the querystring
  var site = querystring.parse(url.parse(req.url).query).url;
  // and redirect the user to /proxy/url
  res.redirect(unblockerConfig.prefix + site);
});

app.listen(8080, function () {});
