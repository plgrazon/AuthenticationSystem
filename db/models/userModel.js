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
      const salt = bcrypt.genSaltSync();
      user.password = bcrypt.hashSync(user.password, salt);
    }
  },
  instanceMethods : {
    validPassword: password => {
      return bcyrpt.compareSync(password, this.password);
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
