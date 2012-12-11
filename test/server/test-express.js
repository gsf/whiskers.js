// test for express compliance

var express = require('express');
var fs = require('fs');
var http = require('http');
var common = require('./common');
var assert = common.assert;
var whiskers = common.whiskers;

common.expected = 1;

var app;
if (express.version.charAt(0) == 2) {
  app = express.createServer();
  app.register('.html', whiskers);
} else {
  app = express();
  app.engine('.html', whiskers.__express);
  // uncomment the following to enable caching of all templates
  //app.use(function(req, res, next){
  //  res.locals.cache = true;
  //  next();
  //});
}
app.set('views', __dirname+'/templates');

app.get('/', function(req, res){
  if (express.version.charAt(0) == 2) {
    res.render('index.html', {title: 'My Site', content: 'Welcome!'});
  } else {
    res.render('newLayout.html', {
      // uncomment to enable caching for this template
      //cache: true, 
      partials: {
        body: 'index.html',
        // test grabbing partials by full path
        footer: __dirname+'/templates/footer.html'
      },
      title: 'My Site',
      content: 'Welcome!',
      author: 'Anton'
    });
  }
});

var expected = fs.readFileSync('test/server/rendered/express.html', 'utf8');

app.listen(3000, function() {
  // once the express server is listening test it with a client
  http.get({
    host: '127.0.0.1',
    port: 3000
  }, function(res) {
    var data = '';
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on('end', function() {
      assert.equal(data, expected);
      process.exit();
    });
  }).on('error', function(e) {
    throw e;
  });
});
