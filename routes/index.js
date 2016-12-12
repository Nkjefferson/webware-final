var express = require('express');
var pg = require('pg');
var fs = require('fs');
var router = express.Router();

// Application specific database code.
var db = require('../database/db');

// Frequently used strings.
const professor_role = 'professor';
const student_role = 'student';

function set_local_db(req, callback) {
  var cb = function() {
    req.session.db_content = GLOBAL.db_content;
    callback();
  };
  db.refresh_db_content(cb);
}

/*
GET home page.
 */
router.get('/', function(req, res, next) {
  var callback = function() {
    if (meets_required_role(req)) {
      // Already logged in.
      res.redirect('/' + req.session.role);
    } else {
      // Not already logged in.
      res.render('login', {logged_in: false});
    }
  };

  set_local_db(req, callback);
});

router.get('/courses', function(req, res, next) {
  var callback = function() {
    if (meets_required_role(req)) {
      // Already logged in.
      res.redirect('/' + req.session.role + '/courses');
    } else {
      // Not already logged in.
      res.render('login', {logged_in: false});
    }
  };

  set_local_db(req, callback);
});


/*
Professor home page.
 */
router.get('/professor', function (req, res, next) {
  // TODO
  res.redirect('/');
});

// View a single professor's profile.
router.post('/professor', function(req, res, next) {
  var professor_id = parseInt(req.body.professor_id);

  var professor = null;
  for (var i = 0; i < GLOBAL.db_content.professors.length; i++) {
    console.log(GLOBAL.db_content.professors[i]);
    console.log(professor_id);
    console.log('\n');
    if (GLOBAL.db_content.professors[i].id == professor_id) {
      professor = GLOBAL.db_content.professors[i];
      break;
    }
  }

  if (professor === null) {
    res.status(500).json({success: false})
  }

  res.render('view_professor', {
    logged_in: true,
    name: professor.name,
    profile: professor.profile,
    img_url: professor.img_url
  });
});

/*
Student home page.
 */
router.get('/student', function (req, res, next) {
  var callback = function() {
    if (meets_required_role(req, student_role)) {
      var callback = function() {
        res.render('student', {
          logged_in: true,
          name: req.session.name,
          profile: req.session.profile ? req.session.profile.replace(/(\r)?\n/g, '<br />') : '',
          img_url: req.session.img_url
        });
      };
      db.login_or_register_student(req, callback);
    }

    else {
      // Not logged in.
      res.redirect('/');
    }
  };

  set_local_db(req, callback);
});

/*
Student view courses page.
 */
router.get('/student/courses', function (req, res, next) {
  var callback = function() {
    if (meets_required_role(req, student_role)) {
      db.get_student_courses(req);
      res.render('student_courses', {
        logged_in: true,
        courses: req.session.courses
      });
    }

    else {
      // Not logged in.
      res.redirect('/');
    }
  };

  set_local_db(req, callback);
});

/*
GET Student edit profile page.
 */
router.get('/student/edit', function(req, res, next) {
  if (meets_required_role(req, student_role)) {
    // Prefill form.
    res.render('edit_student', {
      logged_in: true,
      profile: req.session.profile,
      img_url: req.session.img_url
    });
  } else {

    // Not logged in.
    res.redirect('/');
  }
});

/*
POST Student edit profile page.
 */
router.post('/student/edit', function(req, res, next) {
  if (meets_required_role(req, student_role)) {
    var profile = req.body.profile_text;
    var img_url = req.body.img_url;

    // Update the database, and respond to request.
    db.update_student(profile, img_url, req, res);

  } else {
    // Not logged in.
    res.redirect('/');
  }
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

/*
 Verify that a request is from a properly logged in user.
 */
function meets_required_role(req, required_role) {
  // Pull data from session cookie.
  var role = req.session.role || false;
  var name = req.session.name || false;

  // If a role is specified it must be met.
  if (!(required_role === undefined)) {
    if (role != required_role) {
      return false;
    }
  }

  // Return true if both are defined.
  return (role && name);
}


module.exports = router;

