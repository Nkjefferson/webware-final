'use strict';
module.exports = function(sequelize, DataTypes) {
  var Professor = sequelize.define('Professor', {
    name: DataTypes.TEXT,
    profile: DataTypes.TEXT,
    img_url: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        Professor.hasMany(models.Course);
      }
    }
  });
  return Professor;
};
