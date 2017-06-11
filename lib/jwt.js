'use strict';

let jwt = require('jsonwebtoken');
let config = process.env.NODE_ENV === 'pro' 
				? require('../config/config')
				: require('../config/development')

let redis = require('./redis');

function verify(req, res, next){
	//从head获取token
	let token = req.headers['x-broncos-token'];
	if(!token){
		return res.json({code: 1000, data: {}, msg: 'token is required'});
	}
	//验证token
	jwt.verify(token, config.secret, (err, decode) => {
		if(err) {
			console.log('verify err-->' + err);
			return res.json({code: 401, data: {}, msg: err});
		}
		//验证通过
		let expireIn = decode.expireIn;
		let userId = decode.userId;

		//判断token是否有效
		redis.exists(userId, function(e, ret){
			if(e) throw e;
			console.log('ret-->' + ret);

			if(ret){
				//该token有效，重置token过期时间
				redis.expire(userId, expireIn);
				next();
			}else{
				//token无效
				res.json({code: 401, data: {}, msg: 'invalid token'});
			}
		});
	});
}

module.exports = {
	'verify': verify
}