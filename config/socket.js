module.exports = function(io){
    var fs = require('fs');
    var onlineUsers = 0;
    var userList = [];

    io.on('connection', function(socket){
        var username = null;
        socket.on('user connected', function(data){
            username = data.username;
            userList.push(data.username);
            onlineUsers++;
            console.log(userList);
            io.emit('user broadcast', {
                username: data.username,
                userList: userList,
                onlineUsers: onlineUsers
            });
        });

        socket.on('disconnect', function(){
            userList = userList.splice(userList.indexOf(username) - 1, 1);
            onlineUsers--;
            console.log(userList);
            io.emit('user disconnected', {
                username: username,
                userList: userList,
                onlineUsers: onlineUsers
            });
            console.log(username + ' disconnected!');
        });

        socket.on('chat message', function(data){
            console.log(data.username + ': ' + data.message);
            //Log all chats
            var today = new Date();
            today = today.getFullYear() + '-' + today.getMonth() + 1 + '-' + today.getDate();
            var chat_dir = './public/chat_logs';
            if(!fs.existsSync(chat_dir)){
                fs.mkdirSync(chat_dir);
            }
            fs.appendFile('./public/chat_logs/' + today + '.log',
                data.username + ' [' + (new Date()).getHours() + ':' + (new Date()).getMinutes() + '] -> ' + data.message + '\n',
                'utf-8',
                function(err){
                    if(err) throw err;
                });

            io.emit('global chat message', {
                username: data.username,
                message: data.message
            });
        });
    });
};
