var express = require('express');
var router = express.Router();
var models = require('../models/index');

// This should hopefully not happen much.
router.get('/sync', function (req, res) {
  models.sequelize.sync({force: true});
  res.status(200).json({'status': 'sync_complete'});
});

router.get('/', function(req, res, next) {
  if (req.session.currentStudent) {
    res.render('student', {
      title: 'Profile',
      logged_in: true,
      currentStudent: req.session.currentStudent,
    });
  }

  else if (req.session.currentProfessor) {
    res.render('professor', {
      title: 'Profile',
      logged_in: true,
      currentProfessor: req.session.currentProfessor,
    });
  }

  else {
    res.render('login');
  }
});

router.post('/login', function(req, res, next) {
  if (req.body.role === 'student') {
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
  } else if (req.body.role === 'professor') {

  } else {
    res.status(500);
  }
});

router.post('/api/students', function(req, res) {
  models.Student.find({
    where: {
      name: req.body.name,
    }
  }).then(function(student) {
    if (student) {
      res.json(student);
    } else {
      models.Student.create({
        name: req.body.name,
      }).then(function(student) {
        res.json(student);
      });
    }
  });
});

router.post('/users', function(req, res) {
  models.User.create({
    email: req.body.email
  }).then(function(user) {
    res.json(user);
  });
});

// get all todos
router.get('/todos', function(req, res) {
  models.Todo.findAll({}).then(function(todos) {
    res.json(todos);
  });
});

// get single todo
router.get('/todo/:id', function(req, res) {
  models.Todo.find({
    where: {
      id: req.params.id
    }
  }).then(function(todo) {
    res.json(todo);
  });
});

// add new todo
router.post('/todos', function(req, res) {
  models.Todo.create({
    title: req.body.title,
    UserId: req.body.user_id
  }).then(function(todo) {
    res.json(todo);
  });
});

// update single todo
router.put('/todo/:id', function(req, res) {
  models.Todo.find({
    where: {
      id: req.params.id
    }
  }).then(function(todo) {
    if(todo){
      todo.updateAttributes({
        title: req.body.title,
        complete: req.body.complete
      }).then(function(todo) {
        res.send(todo);
      });
    }
  });
});

// delete a single todo
router.delete('/todo/:id', function(req, res) {
  models.Todo.destroy({
    where: {
      id: req.params.id
    }
  }).then(function(todo) {
    res.json(todo);
  });
});

module.exports = router;
