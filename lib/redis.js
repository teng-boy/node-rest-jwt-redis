'use strict';
/**
 * redis 连接
 */

let redis = require('redis');

let config = process.env.NODE_ENV === 'pro' 
				? require('../config/config')
				: require('../config/development')

let client = redis.createClient(config.redisConfig.port, config.redisConfig.host);

module.exports = client;