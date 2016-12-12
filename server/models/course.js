'use strict';
module.exports = function(sequelize, DataTypes) {
  var Course = sequelize.define('Course', {
    name: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        Course.belongsTo(models.Professor);
        Course.belongsToMany(models.Student,
            {through: 'Registration'},
            {as: 'Students'}
        );
      }
    }
  });
  return Course;
};
