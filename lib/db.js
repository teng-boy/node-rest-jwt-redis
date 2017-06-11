'use strict';
/**
 * mongo 连接
 */

let mongoose = require('mongoose');

let config = process.env.NODE_ENV === 'pro' 
				? require('../config/config')
				: require('../config/development')

let url = 'mongodb://' + config.mongoConfig.host + '/' + config.mongoConfig.database;

mongoose.connect(url);

//连接异常
mongoose.connection.on('error', err => {
	console.log('Mongoose connection error: ' + err);
});

mongoose.connection.once('open', () => {
	console.log('Mongoose connection: ' + url);
});

module.exports = mongoose;