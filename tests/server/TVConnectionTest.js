should = require('should');
colors = require('colors');

ServerTVCommutator     = null;
ServerClientCommutator = null;

require(process.env.PROJECTPATH + 'core/_OS/Core/Core.js');
require(process.env.PROJECTPATH + 'core/_OS/WebServer/CoreAjaxInterface.js');
require(process.env.PROJECTPATH + 'domain/server/TVConnection.js');

Core.registerRequestPoint('TV_CreateConnectionRequest');
Core.registerRequestPoint('TVClient_RegisterAtTVConnectionRequest');
Core.registerRequestPoint('TVClient_UnregisterAtTVConnectionRequest');
Core.registerRequestPoint('TVClient_SyncRequest');

var TestTVConnection = Core.processObject({
      TVConnectionCode: null
    , clientDevice    : 'tv-client-299-' + ("" + Math.random()).substring(2, 8)

    /**
     * @function
     * Test creating TVConnection
     *
     * @param done
     */
    , createConnection: function(done) {
        var device = 'tv-7878299-' + ("" + Math.random()).substring(2, 8);

        FireRequest(
              new TV_CreateConnectionRequest({ Device: device })
            , function(data) { //success
                var TVConnectionCode = data.code;
                TestTVConnection.TVConnectionCode = data.code;

                TVConnection.code2TVConnection[TVConnectionCode].should.have.property('Device', device);
                TVConnection.device2TVConnection[Device._self].should.have.property('code', TVConnectionCode);
                done();
            }
            , function(data) { //fail
                console.log(data);
                done();
            }
            , {} //context
        );
    }

    /**
     * @function
     * Test destroying TVConnection
     *
     * @param done
     */
    , destroyConnection: function(done) {
        TVConnection.destroyTVConnection(TVConnection.code2TVConnection[TestTVConnection.TVConnectionCode]);
        console.log(TVConnection.code2TVConnection);
        console.log(TVConnection.device2TVConnection);
        done();
    }

    /**
     * @function
     * Test creating client connection
     *
     * @param done
     */
    , createClientConnection: function(done) {
        FireRequest(
            new TVClient_RegisterAtTVConnectionRequest({
                  tv_code: TestTVConnection.TVConnectionCode
                , Device : TestTVConnection.clientDevice
            })
            , function(data) { //success
                TVConnection.code2TVConnection[TestTVConnection.TVConnectionCode].tvClients[data.Device._self].should.have.property('Device', TestTVConnection.clientDevice);
                done();
            }
            , function(data) { //fail
                console.log(data);
                done();
            }
        );
    }

    /**
     * @function
     * Test destroying client connection
     *
     * @param done
     */
    , destroyClientConnection: function(done) {
        FireRequest(
            new TVClient_UnregisterAtTVConnectionRequest({
                  Device : TestTVConnection.clientDevice
                , tv_code: TestTVConnection.TVConnectionCode
            })
            , function() { //success
                console.log(TVConnection.code2TVConnection[TestTVConnection.TVConnectionCode].tvClients);
                done();
            }
            , function(data) { //fail
                console.log(data);
                done();
            }
        );
    }

    /**
     * @function
     *
     * @param done
     */
    , syncClient: function(done) {
        FireRequest(
            new TVClient_SyncRequest()
            , function(data) { //success
                data.date.should.be.a.Number;
                done();
            }
            , function(data) { //fail
                console.log(data);
                done();
            }
            , { TVConnection: { code: TestTVConnection.TVConnectionCode } }
        )
    }
});

Core.processNamespace(global);

describe('Test TVConnection', function() {
    it('should be created', function(done) {
        TestTVConnection.createConnection(done);
    });

    it('TVClient should be connected', function(done) {
        TestTVConnection.createClientConnection(done);
    });

    it('TVClient should be synced', function(done) {
        TestTVConnection.syncClient(done);
    });

    it('TVClient should be disconnected', function(done) {
        TestTVConnection.destroyClientConnection(done);
    });

    it('should be destroyed', function(done) {
        TestTVConnection.destroyConnection(done);
    });
});