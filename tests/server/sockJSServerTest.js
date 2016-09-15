var sockjs    = require('sockjs');
var http      = require('http');
var fs        = require('fs');
var sock_path = process.env.PROJECTENV + '/var/battle.sock';

if( fs.existsSync(sock_path) ) {
    fs.unlink(sock_path, function () {
        console.log('successfully deleted ' + sock_path);
    });
}

describe('Test socket server', function() {
    it('create socket server', function(done) {
        var server = http.createServer();
        server.listen(process.env.PROJECTENV + '/var/battle.sock');

        var sockjs_server = sockjs.createServer({sockjs_url: process.env.PROJECTPATH + "integration/lib/sockjs-0.3.js"});
        sockjs_server.installHandlers(server, { prefix: '/battle/tv' });
        done();
    })
});