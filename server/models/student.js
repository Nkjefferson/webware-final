'use strict';
module.exports = function(sequelize, DataTypes) {
  var Student = sequelize.define('Student', {
    name: DataTypes.TEXT,
    profile: DataTypes.TEXT,
    img_url: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        Student.hasMany(models.Course, {as: 'Courses'});
      }
    }
  });
  return Student;
};
