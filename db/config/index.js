const Sequelize = require('sequelize');

const db = new Sequelize('authsystem', 'biosync', '', {
  host: 'localhost',
  dialect: 'postgres'
});

db.authenticate()
  .then(() => {
    console.log('conntected to database');
  })
  .catch(err => {
    console.log('unable to connect to database ', err);
  });

module.exports = {
  db: db
};
