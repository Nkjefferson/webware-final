var express = require('express');
var router = express.Router();
var models = require('../models/index');


// This should hopefully not happen much.
// Force the database schema to match the models.
router.get('/sync', function (req, res) {
  models.sequelize.sync({force: true});
  res.status(200).json({'status': 'sync_complete'});
});


// Redirect index to either student homepage, professor homepage, or login.
router.get('/', function(req, res) {

  // Already logged in student.
  if (req.session.currentStudent) {
    res.render('student', {
      logged_in: true,
      currentStudent: req.session.currentStudent,
    });
  }

  // Already logged in professor.
  else if (req.session.currentProfessor) {
    res.render('professor', {
      logged_in: true,
      currentProfessor: req.session.currentProfessor,
    });
  }

  // Not yet logged in.
  else {
    res.render('login');
  }
});

router.get('/courses', function (req, res) {
  if (req.session.currentStudent) {

    res.render('student_courses', {
      logged_in: true,
      currentProfessor: req.session.currentStudent,
    });
  } else if (req.session.currentProfessor) {
    // Get list of courses belonging to professor.
    var professor_id = req.session.currentProfessor.id;
    models.Course.findAll({
      where: {
        ProfessorId: professor_id,
      }
    }).then(function (courses) {
      res.render('professor_courses', {
        logged_in: true,
        currentProfessor: req.session.currentProfessor,
        courses: courses,
      });
    });

  } else {
    res.status(500);
  }
});

router.post('/courses/add', function(req, res) {
  var professor_id = req.session.currentProfessor.id;
  var course_name = req.body.name;

  models.Course.find({
    where: {
      name: course_name,
      ProfessorId: professor_id,
    }
  }).then(function(course) {
    if (course) {
      res.redirect('/courses');
    } else {
      models.Course.create({
        name: course_name,
        ProfessorId: professor_id,
      }).then(function(course) {
        res.redirect('/courses');
      });
    }
  })
});

router.get('/courses/all', function(req, res) {
  models.Course.findAll({}).then(function (courses) {

    var fucked_object = {
      0: 'e',
      1: 'a',
      2: 'b',
      4: 'c'
    };

    for (var i = 0; i < ("" + fucked_object).length; i++) {
      console.log(fucked_object[i]);
    }

    res.status(500);
    return;

    res.render('all_courses', {
      courses: courses,
      currentStudent: req.session.currentStudent,
      logged_in: true
    });
  });
});

router.post('/courses/all', function(req, res) {
  var course_id = req.body.course_id;
  var student_id = req.body.student_id;

  models.Course.find({
    where: {
      id: course_id
    }
  }).then(function(course) {
    models.Student.find({
      where: {
        id: student_id
      }
    }).then(function(student) {
      course.addStudent(student);
      res.json(course);
    });
  });
});

router.post('/login', function(req, res) {
  if (req.body.role === 'student') {
    // Get or create student instance, save it to session.
    models.Student.find({
      where: {
        name: req.body.name,
      }
    }).then(function(student) {
      if (student) {
        req.session.currentStudent = student;
        res.redirect('/');
      } else {
        models.Student.create({
          name: req.body.name,
        }).then(function(student) {
          req.session.currentStudent = student;
          res.redirect('/');
        });
      }
    });
  }

  else if (req.body.role === 'professor') {
    // Get or create professor instance, save it to session.
    models.Professor.find({
      where: {
        name: req.body.name,
      }
    }).then(function(professor) {
      if (professor) {
        req.session.currentProfessor = professor;
        res.redirect('/');
      } else {
        models.Professor.create({
          name: req.body.name,
        }).then(function(professor) {
          req.session.currentProfessor = professor;
          res.redirect('/');
        });
      }
    });
  }

  else {
    res.status(500);
  }
});


router.get('/logout', function(req, res) {
  req.session.currentStudent = false;
  req.session.currentProfessor = false;
  res.redirect('/');
});


// Update the attributes on a student.
router.post('/student', function(req, res) {
  var student_id = req.session.currentStudent.id;
  models.Student.find({
    where: {
      id: student_id,
    }
  }).then(function(student) {
    if (student) {
      student.updateAttributes({
        name: student.name,
        profile: req.body.profile,
        img_url: req.body.img_url,
      }).then(function(student) {
        req.session.currentStudent = student;
        res.redirect('/');
      });
    }
  });
});

// Update the attributes on a professor.
router.post('/professor', function(req, res) {
  var professor_id = req.session.currentProfessor.id;
  models.Professor.find({
    where: {
      id: professor_id,
    }
  }).then(function(professor) {
    if (professor) {
      professor.updateAttributes({
        name: professor.name,
        profile: req.body.profile,
        img_url: req.body.img_url,
      }).then(function(professor) {
        req.session.currentProfessor = professor;
        res.redirect('/');
      });
    }
  });
});

//router.post('/api/students', function(req, res) {
//  models.Student.find({
//    where: {
//      name: req.body.name,
//    }
//  }).then(function(student) {
//    if (student) {
//      res.json(student);
//    } else {
//      models.Student.create({
//        name: req.body.name,
//      }).then(function(student) {
//        res.json(student);
//      });
//    }
//  });
//});

// get all todos
//router.get('/todos', function(req, res) {
//  models.Todo.findAll({}).then(function(todos) {
//    res.json(todos);
//  });
//});
//
//// get single todo
//router.get('/todo/:id', function(req, res) {
//  models.Todo.find({
//    where: {
//      id: req.params.id
//    }
//  }).then(function(todo) {
//    res.json(todo);
//  });
//});
//
//// add new todo
//router.post('/todos', function(req, res) {
//  models.Todo.create({
//    title: req.body.title,
//    UserId: req.body.user_id
//  }).then(function(todo) {
//    res.json(todo);
//  });
//});
//
//// update single todo
//router.put('/todo/:id', function(req, res) {
//  models.Todo.find({
//    where: {
//      id: req.params.id
//    }
//  }).then(function(todo) {
//    if(todo){
//      todo.updateAttributes({
//        title: req.body.title,
//        complete: req.body.complete
//      }).then(function(todo) {
//        res.send(todo);
//      });
//    }
//  });
//});
//
//// delete a single todo
//router.delete('/todo/:id', function(req, res) {
//  models.Todo.destroy({
//    where: {
//      id: req.params.id
//    }
//  }).then(function(todo) {
//    res.json(todo);
//  });
//});

module.exports = router;
