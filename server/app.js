// *** main dependencies *** //
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var swig = require('swig');
var cookieSession = require('cookie-session');
var nunjucks = require('nunjucks')



// *** routes *** //
var routes = require('./routes/index.js');
var api_routes = require('./routes/api.js');


// *** express instance *** //
var app = express();


//*** view engine *** //
var swig = new swig.Swig();
app.engine('html', swig.renderFile);
app.set('view engine', 'html');

// View engine setup.
// nunjucks.configure('views', {
//     autoescape: true,
//     express: app
// });
// app.set('views', path.join(__dirname, 'server/views'));
// app.engine( 'html', nunjucks.render ) ;
// app.set('view engine', 'html');


// *** static directory *** //
app.set('views', path.join(__dirname, 'views' ));


// *** config middleware *** //
app.use(cookieSession({name: 'session', keys: ['key1', 'key2'], maxAge: 24 * 60 * 60 * 1000}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client')));


// *** main routes *** //
app.use('/', routes);
app.use('/api/', api_routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// *** error handlers *** //

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
