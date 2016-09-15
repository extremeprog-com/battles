http   = require('http');
sockjs = require('sockjs');
fs     = require('fs');
colors = require('colors');


require(process.env.PROJECTPATH + '/core/_OS/Core/Core.js');
require(process.env.PROJECTPATH + '/core/_OS/WebServer/CoreAjaxInterface.js');
require(process.env.PROJECTPATH + '/core/_OS/WebServer/ServerCommutator.js');

BattleServer = {
    Init: new Core.EventPoint()

    , sock_path: process.env.PROJECTENV + '/var/BattleServer.sock'

    , listen: function() {
        CatchEvent(BattleServer.Init);

        this.server = http.createServer();

        if( fs.existsSync(BattleServer.sock_path) ) {
            fs.unlink(BattleServer.sock_path, function () {
                console.log('successfully deleted ' + BattleServer.sock_path);
            });
        }
        this.server.listen(BattleServer.sock_path, function() {
            fs.chmod(BattleServer.sock_path, 0666);
        });
    }
    , stopOnSignal: function() {
        CatchEvent(BattleServer.Init);

        process.on('SIGTERM', BattleServer.stopServer);
        process.on('SIGINT' , BattleServer.stopServer);
    }
    , stopServer: function() {
        //если процесс убивается, удаляем файл сокета, созданный ранее
        fs.unlink(BattleServer.sock_path);
        process.exit();
    }
};


require('./ServerClientCommutator.js');
require('./ServerTVCommutator.js');
require('./Battle.js');
require('./TVConnection.js');

Core.processObject(BattleServer);
Core.processObject(ServerClientCommutator);
Core.processObject(ServerTVCommutator);
Core.processObject(Battle);
Core.processObject(TVConnection);

