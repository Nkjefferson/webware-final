var express = require('express');
var pg = require('pg');
var router = express.Router();
var connection_string = (process.env.DATABASE_URL || 'postgres://localhost:5432/webware');

// Creates a student entry with the given name, if it doesn't already exist.
function create_student(name, res) {
  var qs = "INSERT INTO students(name) SELECT ($1) WHERE NOT EXISTS " +
            "(SELECT name FROM students WHERE name=$2);";
  var data = [name, name];

  pg.connect(connection_string, function (err, client, done) {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    // Insert the new student.
    var query = client.query(qs, data);

    query.on('end', function() {
      done();
      get_student_attrs(name, res);
    });
  });
}

function get_student_attrs(name, res) {
  var qs = "SELECT (name) FROM students WHERE name=$1";
  var data = [name];
  var results = [];

  pg.connect(connection_string, function (err, client, done) {
    // Handle connection errors.
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    // Insert the new student.
    var query = client.query(qs, data);

    // Push each new row to results. Should only be one...
    query.on('row', function(row) {
      results.push(row);
    });

    // Finally respond to request.
    query.on('end', function() {
      done();
      var name = results[0].name;
      return res.render('student', {logged_in: true, name: name});
    })
  });
}

// function create_student(name) {
//   var results = [];
//   var query = client.query(qs, [name]);
//
//   query.on('end', function() {
//     client.end();
//   });
// }

/* GET home page. */
router.get('/', function(req, res, next) {
  var role = req.session.role || false;
  var name = req.session.name || false;

  // Already logged in.
  if (role && name) {

    // Redirect to professor page.
    if (role == "professor") {
      res.redirect('/professor');

    // Redirect to student page.
    } else if (role == "student") {
      res.redirect('/student');
    }

  // Not already logged in.
  } else {
    res.render('login', {logged_in: false});
  }
});

router.get('/professor', function (req, res, next) {
  var role = req.session.role || false;
  var name = req.session.name || false;

  if (!(role && name) || (role != 'professor')) {
    res.redirect('/');
  }

  res.render('professor', {logged_in: true});
});

router.get('/student', function (req, res, next) {
  var role = req.session.role || false;
  var name = req.session.name || false;

  if (!(role && name) || (role != 'student')) {
    res.redirect('/');
  }

  // Create student entry if it doesn't exist.
  create_student(name, res);
});

router.get('/logout', function (req, res, next) {
  req.session.role = false;
  req.session.name = false;
  res.redirect('/');
});

router.post('/login', function(req, res, next) {
  var role = req.body.role || false;
  var name = req.body.name || false;

  if (role && name) {
    req.session.role = role;
    req.session.name = name;
  }

  res.redirect('/');
});

module.exports = router;

