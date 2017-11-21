'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('Users', {
    id: DataTypes.INTEGER,
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    pass: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return User;
};