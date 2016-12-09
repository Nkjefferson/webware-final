var express = require('express');
var pg = require('pg');
var fs = require('fs');
var router = express.Router();

// Application specific database code.
var db = require('../database/db');

// Frequently used strings.
const professor_role = 'professor';
const student_role = 'student';

/*
GET home page.
 */
router.get('/', function(req, res, next) {
  if (meets_required_role(req)) {


    // Already logged in.
    res.redirect('/' + req.session.role);
  } else {

    // Not already logged in.
    res.render('login', {logged_in: false});
  }
});

router.get('/courses', function(req, res, next) {
  if (meets_required_role(req)) {
    // Already logged in.
    res.redirect('/' + req.session.role + '/courses');
  } else {
    // Not already logged in.
    res.render('login', {logged_in: false});
  }
});


/*
Professor home page.
 */
router.get('/professor', function (req, res, next) {
  if (meets_required_role(req, professor_role)) {

    // Login to existing account, or create a new one.
    //db.login_or_register_professor(req, res);
  }

  else {
    // Not logged in.
    res.redirect('/');
  }
});

/*
Student home page.
 */
router.get('/student', function (req, res, next) {
  if (meets_required_role(req, student_role)) {

    // Login to existing account, or create a new one.
    db.login_or_register_student(req, res);
  }

  else {
    // Not logged in.
    res.redirect('/');
  }
});

/*
Student view courses page.
 */
router.get('/student/courses', function (req, res, next) {
  if (meets_required_role(req, student_role)) {
    // Grab list of courses from database.
    db.get_student_courses(req, res);
  }

  else {
    // Not logged in.
    res.redirect('/');
  }
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

