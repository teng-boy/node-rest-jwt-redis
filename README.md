# 环境
1、开发使用node版本：v8.0.0

2、demo依赖mongo和redis，所以在使用该demo的时候，必须在本地成功安装它们。

# mongo
1、连接信息文件，参考`lib`下的`db.js`文件

2、用途：保存测试数据
```
用户model如下：
{
  'name': String,
  'pwd': String
}
```
3、配置：进入项目根目录，查看`config`文件夹下的`development.js`，修改对应的`mongoConfig`即可
```
//mongo连接信息
mongoConfig: {
  "host": "192.168.33.10",
  "database": "rest_test"
}
```

# redis
1、连接信息文件，参考`lib`下的`redis.js`文件

2、保存token，刷新维护token
```
说明：系统默认token有效期为2h。
```
3、配置：进入项目根目录，查看`config`文件夹下的`development.js`，修改对应的`redisConfig`即可
```
//redis连接信息
redisConfig: {
  "host": "192.168.33.10",
  "port": 6379
}
```

# 关于token
demo使用了简单的jsonwebtoken模块管理token。
```
关键代码：
//token验证
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
```
```
说明：
1、token是由header＋payload＋secret组合而成的。
2、demo中payload部分组成如下：
{
    'user': 'xxx', //用户 _id
    'expireIn': xxx //单位：秒，token有效时间，demo默认2h
}
3、secret是签名，保证token安全的关键，不可暴露
4、关于jsonwebtoken的细致方面，可网上行搜索。
```

# 使用说明
1、拉取代码到本地：`https://github.com/broncoss/node-rest-jwt-redis.git`

2、启动方式：进入项目根目录，先`npm install`安装依赖，再执行`./bin/develop.sh`启动项目

3、除了生成token API `/v1/token` 外，其他所有API接口都需在header中传递`x-broncos-token`（其value为生成的token）

4、使用`post`方式请求`/v1/token`获取token时需要传`name`和`pwd`，但为了方便测试，系统默认`name`和`pwd`的值为`test`

5、在请求获取token时，可通过传`expireIn`自行设置token有效时间。在token有效期内访问API，系统自动刷新token有效时间。token一旦过期，需要重新获取token

# 线上测试案例
1、生成有效期为100秒的token
```
curl -l -H "Content-type: application/json" -X POST -d '{"name": "test", "pwd": "test", "expireIn": 100}' http://api.broncodes.com/v1/token
```
```
返回案例：
{
  "code":200,
  "data":{
    "user":{
      "__v":0,
      "name":"test",
      "pwd":"test",
      "_id":"593feff1e5fe22001003b812 //用户ID
    },
    "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1OTNmZWZmMWU1ZmUyMjAwMTAwM2I4MTIiLCJleHBpcmVJbiI6MTAwMDAwMCwiaWF0IjoxNDk3MzYyNDE3fQ.rcZp6DlRIgjr8lID7nV4nV9pxLEz_FNlVnG1US1GHdg"
  },
  "msg":"success"
}
```
2、根据用户ID查询用户
```
curl -H "x-broncos-token:获取的token" -X GET http://api.broncodes.com/v1/users/用户ID
```
```
返回案例：
{
  "code":200,
  "data":{
    "_id":"593feff1e5fe22001003b812",
    "name":"test",
    "pwd":"test",
    "__v":0
  },
  "msg":"success"
}
```
3、获取所有用户
```
curl -H "x-broncos-token:获取的token" -X GET http://api.broncodes.com/v1/users
```
```
返回案例：
{
  "code":200,
  "data":[{
    "_id":"593ebf50e5fe22001003b810",
    "name":"test",
    "pwd":"test",
    "__v":0
  },{
    "_id":"593feff1e5fe22001003b812",
    "name":"test",
    "pwd":"test",
    "__v":0
  }],
  "msg":"success"
}

```
4、根据用户ID删除用户
```
curl -H "x-broncos-token:获取的token" -X DELETE http://api.broncodes.com/v1/users/用户ID
```
```
返回案例：
{
  "code":200,
  "data":{},
  "msg":"success"
}
```