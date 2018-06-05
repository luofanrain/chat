var ws = require('nodejs-websocket');
// var redis = require('redis');
// var bluebird = require('bluebird');
// bluebird.promisifyAll(redis.RedisClient.prototype);
// bluebird.promisifyAll(redis.Multi.prototype)
var PORT = 9000;
var users =[];
var messages =[];
//key存放用户信息
// var client = redis.createClient('6379','127.0.0.1');
// client.on('error',function(err){
// 	console.log(err);
// 	console.log(err+',redis缓存链接失败')
// });
//101--用户名重复
var server = ws.createServer(function(res){
	res.on('text',function(val){
		//data为前端发过来的数据

		val = JSON.parse(val);		
		val.status=200;
		var data = val.data || {};
		data.name = data.name;
		console.log(val);
		if(val.type == "error"){
			if(data.name == "undefine"){
				return;
			}
			users.splice(users.indexOf(data.name),1);
			return;
		}

		if(val.type == 'enter'){
			if(users.indexOf(data.name) == -1){
				data.group = users;
				users.push(data.name);
			}else{
				val.status = 101;
				val.message = "用户已经登陆"
			}
		}
		if(val.type == 'message'){
			messages.push(val.data);
		}
		if(val.type == 'list'){
			val.countData = messages;
			val.endMessage = data;
			val.endMessage.message = "";
			val.endMessage.time = "";
			if(messages.length){			
				messages.forEach(function(value,index){
					if(value.name == data.name && value.toname==data.toname || value.toname == data.name && value.name==data.toname){
						val.endMessage = value;
					}
				})
			}
		}
		sendMessage(JSON.stringify(val));
	})
	res.on('close',function(code,data){
		var data = {};
		data.status = 1003;
		data.type = " error";
		sendMessage(JSON.stringify(data));
	})
	res.on('error',function(err){
		console.log('发生错误了:'+err);
	})
}).listen(PORT);
function sendMessage(val){
	server.connections.forEach(function(connection) {
        connection.sendText(val);
    })
}