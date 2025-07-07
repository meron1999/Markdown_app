'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // User has many Boards
      User.hasMany(models.Board, {
        foreignKey: 'userId',
      });
    }
  }
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pass: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'パスワードを入力してください',
        },
      },
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};