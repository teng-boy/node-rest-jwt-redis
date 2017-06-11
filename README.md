# node-rest-jwt-redis
1. 说明：基于restify＋jsonwebtoken+redis开发的restful api demo。
2. 线上测试地址：http://xxx
3. 开发所用node版本：v8.0.0
4. github地址：https://github.com/broncoss/node-rest-jwt-redis.git
5. 启动方式：进入项目根目录，先`npm install`，再执行`./bin/develop.sh`启动项目。
6. 关于token生成：用户传递`name`和`pwd`，请求http://localhost:9000/v1/token生成token时，如果在body体传了expireIn（用于设置token有效时间，单位：秒），则以用户所传的expireIn为准。否则系统默认token有效时间为2个小时。
7. 关于token使用：除了生成token的API接口，其它接口必须在请求头head传`x-broncos-token`（其value为token），验证请求的有效性。另，在token的有效期内，继续访问相关API接口，会重置token有效时间，方便用户正常访问。
8. 使用案例：

- 生成有效期为100秒的token：curl -l -H "Content-type: application/json" -X POST -d '{"name": "test", "pwd": "test", "expireIn": 100}' http://localhost:9000/v1/token
- 获取所有用户：curl http://localhost:9000/v1/users

