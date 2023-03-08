const Sequelize = require('sequelize')
const logger = require('../utils/logger')

const sequelize = new Sequelize('evento_nvr_dvr', 'dev', 'www32391804', {
    host: '10.50.2.126',
    dialect: 'mysql',
    logging: false
});
sequelize.authenticate().then(() => {
    logger.info('Connection has been established successfully MYSQL.');
}).catch((error) => {
    logger.info('Unable to connect to the database MYSQL: ', error);
});

module.exports = sequelize;