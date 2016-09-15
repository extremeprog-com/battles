/** @name TVConnection_ParticipantListChanged */
Core.registerEventPoint('TVConnection_ParticipantListChanged');

/** @name TVConnection_Created */
Core.registerEventPoint('TVConnection_Created');

/** @name TVConnection_Restored */
Core.registerEventPoint('TVConnection_Restored');

/** @name TVConnection_SyncRequest */
/** @name TVConnection_SyncRequest_Success */
/** @name TVConnection_SyncRequest_Fail */
Core.registerRequestPoint('TVConnection_SyncRequest');

TVConnection = {
      code2TVConnection      : {} //массив TV Connections
    , device2TVConnection    : {}

    , tvDevice2connection    : {}
    , tvCode2connection      : {}

    , clientDevice2connection: {}
    , clientCode2connection  : {}

    , tvClientsDictionary    : {}

    , dt  : null
    /**
     * @function
     *
     * Создаем TVConnection
     */
    , createOrRestoreTVConnection: function() {
        var
              request = CatchRequest(TV_CreateConnectionRequest)
            , context = Core.fetchContext()
            , _this   = this;

        return function(success) {
            var
                  TVConnection
                , events = [
                      'TVConnection_Created'
                    , 'TVConnection_Restored'
                    , 'TVConnection_ParticipantListChanged'
                    , 'TVClient_ScoreCounted'
                    , 'Battle_Created'
                    , 'Battle_Started'
                    , 'Battle_Paused'
                    , 'Battle_Resumed'
                    , 'Battle_Finished'
                    , 'Battle_Stopped'
                ]
                , requests = [
                      'TVClient_AddSongToPlaylistRequest'
                    , 'TVConnection_SyncRequest'
                ];

            if( _this.device2TVConnection[request.Device._self] && !request.force ) {
                TVConnection = _this.device2TVConnection[request.Device._self];

                //подпишем телевизор на прием событий и реквестов
                if( ServerTVCommutator ) {
                    ServerTVCommutator.subscribe_other_side(context.Commutator.connection, events,   { TVConnection: { code: TVConnection.code } });
                    ServerTVCommutator.subscribe_other_side(context.Commutator.connection, requests, { TVConnection: { code: TVConnection.code } });
                }

                console.log('TVConnection -> '.green + 'restored with code ' + _this.device2TVConnection[request.Device._self].code);

                success(TVConnection);
                FireEvent(
                    new TVConnection_Restored({
                        TVConnection: TVConnection
                    })
                    , { TVConnection: { code: TVConnection.code } }
                );
            } else {
                if( request.force ) {
                    _this.destroyTVConnection(_this.device2TVConnection[request.Device._self]);
                }

                TVConnection = {
                      code      : ("" + Math.random()).substring(2, 9)
                    , Device    : request.Device._self
                    , tvClients : []
                    , dt        : 0
                };

                _this.code2TVConnection  [TVConnection.code]   = TVConnection;
                _this.device2TVConnection[TVConnection.Device] = TVConnection;

                console.log('TVConnection ->'.green + ' created');
                console.log('TVConnection ->'.green + ' code: ' + _this.device2TVConnection[request.Device._self].code
                    + ', Device: ' + _this.device2TVConnection[request.Device._self].Device);

                //подпишем телевизор на прием событий и реквестов
                if( ServerTVCommutator ) {
                    ServerTVCommutator.subscribe_other_side(context.Commutator.connection, events,   { TVConnection: { code: TVConnection.code } });
                    ServerTVCommutator.subscribe_other_side(context.Commutator.connection, requests, { TVConnection: { code: TVConnection.code } });
                }

                success(TVConnection);
                FireEvent(
                    new TVConnection_Created({
                        TVConnection: TVConnection
                    })
                    , { TVConnection: { code: TVConnection.code } }
                );
            }
        }
    }
    /**
     * @function
     *
     * Удаляем TVConnection
     * @param TVConnection
     */
    , destroyTVConnection: function(TVConnection) {
        console.log('TVConnection ->'.green + ' destroyed');
        console.log('TVConnection ->'.green + ' code: ' + TVConnection.code
            + ', Device: ' + TVConnection.Device);

        delete this.code2TVConnection  [TVConnection.code];
        delete this.device2TVConnection[TVConnection.Device];
        //ServerClientCommutator.unsubscribe_other_side();
    }
    /**
     * @function
     *
     * Добавляем пользователя к TVConnection
     * @returns {Function}
     */
    , createClientConnection: function() {
        var
              request = CatchRequest(TVClient_RegisterAtTVConnectionRequest)
            , context = Core.fetchContext()
            , _this   = this;

        //console.log(request);

        console.log('TVConnection ->'.yellow + ' create client connection');

        return function(success, fail) {
            var events = [
                    'Battle_Created'
                  , 'Battle_Started'
                  , 'Battle_Paused'
                  , 'Battle_Resumed'
                  , 'Battle_Finished'
                  , 'Battle_Stopped'
                  , 'TV_PlaylistChanged'
            ];

            if( _this.code2TVConnection[request.tv_code] ) {

                if( !_this.code2TVConnection[request.tv_code].tvClients.reduce(function(res, tvClient){
                        return res || (tvClient.Device == request.Device._self)
                    }, false)) {
                    var code = ("" + Math.random()).substring(2, 8);

                    _this.code2TVConnection[request.tv_code].tvClients.push({
                          id       : code
                        , Device   : request.Device._self
                        , user_name: request.user_name
                        , avatar   : request.avatar
                    });

                    _this.tvClientsDictionary[request.Device._self] = _this.code2TVConnection[request.tv_code].tvClients.length - 1;
                }

                console.log('TVConnection ->'.yellow + ' code: ' + request.tv_code + ', Device: ' + request.Device._self);

                //подпишем клиентов (мобильники) на прием ивентов
                if( ServerClientCommutator ) {
                    ServerClientCommutator.subscribe_other_side(context.Commutator.connection, events, { TVConnection: { code: _this.code2TVConnection[request.tv_code].code } });
                }

                var data = _this.code2TVConnection[request.tv_code].tvClients.filter(function(i){ return i.Device == request.Device._self })[0];

                if( Battle.battleToTVConnection[request.tv_code] ) {
                    data.current_battle = Battle.battleToTVConnection[request.tv_code];
                }

                success(data);

                FireEvent(
                    new TVConnection_ParticipantListChanged({
                        tvClients : _this.code2TVConnection[request.tv_code].tvClients
                    })
                    , { TVConnection: { code: request.tv_code } }
                );
            } else {
                fail();
            }
        }
    }

    /**
     * @function
     *
     * Удаляем пользователя из TVConnection
     * @returns {Function}
     */
    , deleteClientConnection: function() {
        var
              request = CatchRequest(TVClient_UnregisterAtTVConnectionRequest)
            , context = Core.fetchContext()
            , _this   = this;


        return function(success, fail) {
            if( _this.code2TVConnection[request.tv_code] ) {
                var tvClients = _this.code2TVConnection[request.tv_code].tvClients;

                if( _this.tvClientsDictionary.hasOwnProperty(request.Device._self) ) {
                  var idx = _this.tvClientsDictionary[request.Device._self];

                  _this.code2TVConnection[request.tv_code].tvClients.splice(idx, 1);
                  delete _this.tvClientsDictionary[request.Device._self];

                  if( ServerClientCommutator ) ServerClientCommutator.unsubscribe_other_side(context.Commutator.connection);

                  success();
                  console.log('TVConnection ->'.yellow + ' close client connection');
                  console.log('TVConnection ->'.yellow + ' code: ' + request.tv_code + ', Device: ' + request.Device._self);

                  FireEvent(
                    new TVConnection_ParticipantListChanged({
                      tvClients : _this.code2TVConnection[request.tv_code].tvClients
                    })
                    , { TVConnection: { code: request.tv_code } }
                  );
                }
            } else {
                fail();
            }
        }
    }

    /**
    * @function
    *
    */
    , updateClientInfo: function() {
        var
              event   = CatchEvent(TVClient_UpdateProfile)
            , context = Core.fetchContext
            , _this   = this;

        if( this.code2TVConnection[event.tv_code] && this.code2TVConnection[event.tv_code].tvClients[event.Device._self] ) {
          if( _this.tvClientsDictionary.hasOwnProperty(event.Device._self) ) {
            var idx = _this.tvClientsDictionary[event.Device._self];
            this.code2TVConnection[event.tv_code].tvClients[idx].avatar    = event.avatar;
            this.code2TVConnection[event.tv_code].tvClients[idx].user_name = event.user_name;

            FireEvent(
              new TVConnection_ParticipantListChanged({
                tvClients : _this.code2TVConnection[event.tv_code].tvClients
              })
              , { TVConnection: { code: event.tv_code }}
            );
          }
        }
    }

    /**
     * @function
     *
     */
    , updatePlaylist: function() {
        var
              event   = CatchEvent(TV_PlaylistChanged)
            , context = Core.fetchContext();

        this.code2TVConnection[context.TVConnection.code].playlist = event.playlist;
    }

    , receiveClientScore: function() {
        var
              event   = CatchEvent(TVClient_ScoreCounted)
            , context = Core.fetchContext();

            console.log(event);
    }

    /**
     * @function
     * Синхронизация по времени с TV
     */
    , sendSyncRequest: function() {
        var
            event = CatchEvent(TVConnection_Created)
            , _this = this;

        var dt = 0, dt_samples = 0;

        setInterval(function() {
            console.log('TVConnection ->'.green + ' sync time with TV with code ' + event.TVConnection.code + ': their time is ' + (new Date(+new Date + dt)));
            var startRequestTime = +new Date();

            FireRequest(
                new TVConnection_SyncRequest()
                , function(data) {
                    //вычисляем дельту времени между сервером и телевизором и сохраняем значение
                    dt = (dt * dt_samples + (data - ( +new Date() + startRequestTime ) / 2)) / (++dt_samples)
                    dt_samples *= 0.9;
                    _this.code2TVConnection[event.TVConnection.code].dt = dt;
                }
                , function() {}
                , { TVConnection: { code: event.TVConnection.code } }
            );
        }, 5000);
    }


    /**
     * @function
     * Синхронизация времени с клиентом
     *
     */
    , syncClient: function() {
        var
              request = CatchRequest(TVClient_SyncRequest)
            , context = Core.fetchContext()
            , _this   = this;

        return function(success, fail) {
            console.log('TVConnection ->'.yellow + ' sync time with TVClient with TVConnection code ' + context.TVConnection.code);
            //отправляем серверное время с учетом дельты соответствующего телевизора
            var TVConnection = _this.code2TVConnection[context.TVConnection.code];
            if( TVConnection ) {
                success({date: +new Date() + TVConnection.dt});
            } else {
                fail();
            }
        }
    }
};
