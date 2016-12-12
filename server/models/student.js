'use strict';
module.exports = function(sequelize, DataTypes) {
  var Student = sequelize.define('Student', {
    name: DataTypes.TEXT,
    profile: DataTypes.TEXT,
    img_url: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        Student.belongsToMany(models.Course,
            {through: 'Registration'},
            {as: 'Courses'}
        );
      }
    }
  });
  return Student;
};
