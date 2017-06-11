'use strict';

let restify = require('restify');

//创建server
let server = restify.createServer();

server.use(restify.fullResponse());
server.use(restify.bodyParser());


//引入API
require('./api')(server);

//监听启动
server.listen(9000, () => {
	console.log('%s listening as %s', server.name, server.url);
});