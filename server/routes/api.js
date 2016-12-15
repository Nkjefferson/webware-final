var express = require('express');
var router = express.Router();
var models = require('../models/index');

/*
GET lists of objects.
 */

// Respond with JSON array of all courses.
router.get('/courses', function(req, res) {
  models.Course.findAll({
     include: [{all: true}]
  }).then(function(courses) {
    res.json(courses);
  }).catch(function(error) {
    res.status(500).end();
  });
});

//Respond with JSON array of all students.
router.get('/students', function(req, res) {
  models.Student.findAll({
    include: [{all: true}]
  }).then(function(students) {
    res.json(students);
  }).catch(function(error) {
    res.status(500).end();
  });
});

// Respond with JSON array of all professors.
router.get('/professors', function(req, res) {
  models.Professor.findAll({
    include: [{all: true}]
  }).then(function(professors) {
    res.json(professors);
  }).catch(function(error) {
    res.status(500).end();
  });
});

/*
POST new objects.
 */

// Get or create a professor with the given name.
// Respond with JSON object for professor.
router.post('/professors', function(req, res) {
  models.Professor.findOrCreate({
    where: {
      name: req.body.name
    },
    include: [{all: true}]
  }).spread(function(professor, created) {
    res.json(professor);
  }).catch(function(error) {
    res.status(500).end();
  });
});

// Get or create a student with the given name.
// Respond with JSON object for student.
router.post('/students', function(req, res) {
  models.Student.findOrCreate({
    where: {
      name: req.body.name
    },
    include: [{all: true}]
  }).spread(function(student, created) {
    res.json(student);
  }).catch(function(error) {
    res.status(500).end();
  });
});

// Get or create a course with the given name and professor.
// Respond with JSON object for course.
router.post('/courses', function(req, res) {
  console.log(req.body);
  models.Course.findOrCreate({
    where: {
      name: req.body.name,
      ProfessorId: req.body.professor_id
    },
    include: [{all: true}]
  }).spread(function(course, created) {
    res.json(course);
  }).catch(function(error) {
    res.status(500).end();
  });
});

// Get or create a course registration for the given course and student.
// Respond with a JSON object for course.
router.post('/registrations', function(req, res) {
  models.Student.find({
    where: {
      id: req.body.student_id
    },
    include: [{all: true}]
  }).then(function(student) {
    models.Course.find({
      where: {
        id: req.body.course_id
      },
      include: [{all: true}]
    }).then(function(course) {
      course.addStudent(student);
      res.json(course);
    }).catch(function(error) {
      res.status(500).end();
    });
  }).catch(function(error) {
    res.status(500).end();
  });
});

/*
UPDATE objects.
 */
router.put('/professors/:id', function(req, res) {
  models.Professor.find({
    where: {
      id: req.params.id
    },
    include: [{all: true}]
  }).then(function(professor) {
    if(professor){
      professor.updateAttributes({
        profile: req.body.profile,
        img_url: req.body.img_url
      }).then(function(professor) {
        req.session.currentProfessor = professor;
        res.json(professor);
      });
    }
  });
});

router.put('/students/:id', function(req, res) {
  models.Student.find({
    where: {
      id: req.params.id
    },
    include: [{all: true}]
  }).then(function(student) {
    if(student){
      student.updateAttributes({
        profile: req.body.profile,
        img_url: req.body.img_url
      }).then(function(student) {
        req.session.currentStudent = student;
        res.json(student);
      });
    }
  });
});

/*
DELETE objects.
 */

// Remove a course registration for the given course and student.
// Respond with a JSON object for course.
router.delete('/registrations', function(req, res) {
  models.Student.find({
    where: {
      id: req.body.student_id
    },
    include: [{all: true}]
  }).then(function(student) {
    models.Course.find({
      where: {
        id: req.body.course_id
      },
      include: [{all: true}]
    }).then(function(course) {
      course.removeStudent(student);
      res.json(course);
    }).catch(function(error) {
      res.status(500).end();
    });
  }).catch(function(error) {
    res.status(500).end();
  });
});

// Remove the specified course.
// Respond with blank 200.
router.delete('/courses/:id', function(req, res) {
  models.Course.destroy({
    where: {
      id: req.params.id,
    },
    force: true
  }).then(function() {
    res.json({deleted: true});
  }).catch(function(error) {
    res.status(500).end();
  });
});


module.exports = router;
