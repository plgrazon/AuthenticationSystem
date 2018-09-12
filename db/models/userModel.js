const Sequelize = require('sequelize');
const { db } = require('../config');
const bcrypt = require('bcrypt');

const User = db.define('users', {
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  hooks: {
    beforeCreate: user => {
      const saltRounds = 10;
      bcrypt.genSalt(saltRounds, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
          user.password = hash;
        });
      });
    }
  }, instanceMethods : {
    validPassword: password => {
      bcyrpt.compare(password, this.password, (err, res) => {
        if (res) {
          return true;
        }
        return false;
      })
    }
  }
});

User.sync({force: true})
  .then(() => {
    console.log('table created');
  })
  .catch(err => {
    console.log('error creating table: ', error);
  });

  module.exports = {
    User: User
  };
