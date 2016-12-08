var express = require('express');
var pg = require('pg');
var fs = require('fs');
var router = express.Router();
var connection_string = 'postgres://dotooizxzqvdva:4Ls5P_fmj03gfK4BlJDrWg6d2K@ec2-54-227-250-80.compute-1.amazonaws.com:5432/d3qeftjnshumcp?ssl=true';

// Creates a student entry with the given name, if it doesn't already exist.
function create_student(name, req, res) {
  var qs = "INSERT INTO student(name) SELECT ($1) WHERE NOT EXISTS " +
            "(SELECT name FROM student WHERE name=$2);";
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
      get_student_attrs(name, req, res);
    });
  });
}

function get_student_attrs(name, req, res) {
  var qs = "SELECT row_to_json(r) FROM (SELECT (name, profile, img_url) FROM student WHERE name=$1) r";
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
      var obj = row.row_to_json.row;
      results.push({
        name: obj.f1,
        profile: obj.f2,
        img_url: obj.f3
      });
      results.push(obj);
    });

    // Finally respond to request.
    query.on('end', function() {
      done();

      var profile = results[0].profile;
      req.session.profile = profile;

      var img_url = results[0].img_url;
      req.session.img_url = img_url;

      return res.render('student', {
        logged_in: true,
        name: results[0].name,
        profile: profile ? profile.replace(/(\r)?\n/g, '<br />') : '',
        img_url: img_url
      });
    })
  });
}

router.get('/proposal', function (req, res, next) {
  res.end(fs.readFileSync('proposal.txt'));
});

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
  var  classes = ["cs3013", "cs3733","cs4241"];

  if (!(role && name) || (role != 'professor')) {
    res.redirect('/');
  } else {
    res.render('professor', {logged_in: true, class:classes});
  }
});

router.get('/addClass', function (req, res, next) {
  var role = req.session.role || false;
  var name = req.session.name || false;
  var  classes = ["cs3013", "cs3733","cs4241"];

  if (!(role && name) || (role != 'professor')) {
    res.redirect('/');
  } else {
    res.render('addClass', {logged_in: true, class:classes});
  }
});

router.get('/student', function (req, res, next) {
  var role = req.session.role || false;
  var name = req.session.name || false;

  if (!(role && name) || (role != 'student')) {
    res.redirect('/');
  } else {
    // Create student entry if it doesn't exist.
    // This function also renders the response, afterwards.
    create_student(name, req, res);
  }
});

router.get('/student/edit', function(req, res, next) {
  var role = req.session.role || false;
  var name = req.session.name || false;

  if (!(role && name) || (role != 'student')) {
    res.redirect('/');
  } else {
    res.render('edit_student', {
      logged_in: true,
      profile: req.session.profile,
      img_url: req.session.img_url
    });
  }
});

router.post('/student/edit', function(req, res, next) {
  var role = req.session.role || false;
  var name = req.session.name || false;

  if (!(role && name) || (role != 'student')) {
    res.redirect('/');
  } else {
    var profile = req.body.profile_text;
    var img_url = req.body.img_url;

    // Update the database.
    // This function will also render the response after.
    update_student(profile, img_url, req, res);
  }
});

function update_student(profile, img_url, req, res) {
  var qs = "UPDATE student SET profile=$1, img_url=$2 WHERE name=$3";
  var data = [profile, img_url, req.session.name];

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
      res.redirect('/student');
    });
  });
}

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

