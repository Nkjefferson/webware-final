var express = require('express');
var router = express.Router();
var models = require('../models/index');

// Respond with JSON array of all courses.
router.get('/courses', function(req, res) {
  models.Course.findAll({
     include: [{all: true}]
  }).then(function(courses) {
    res.json(courses);
  })
});

// Respond with JSON array of all students.
router.get('/students', function(req, res) {
  models.Student.findAll({
    include: [{all: true}]
  }).then(function(students) {
    res.json(students);
  });
});

// Respond with JSON array of all professors.
router.get('/professors', function(req, res) {
  models.Professor.findAll({
    include: [{all: true}]
  }).then(function(professors) {
    res.json(professors);
  });
});

// Get or create student 
// Get or create professor

module.exports = router;
