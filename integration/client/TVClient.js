/** @name TVClient_RegisterAtTVConnectionRequest подключение к TV Connection */
/** @name TVClient_RegisterAtTVConnectionRequest_Success подключение к TV Connection */
/** @name TVClient_RegisterAtTVConnectionRequest_Fail подключение к TV Connection */
Core.registerRequestPoint('TVClient_RegisterAtTVConnectionRequest');

/** @name TVClient_UnregisterAtTVConnectionRequest отключение от TV Connection */
/** @name TVClient_UnregisterAtTVConnectionRequest_Success отключение от TV Connection */
/** @name TVClient_UnregisterAtTVConnectionRequest_Fail отключение от TV Connection */
Core.registerRequestPoint('TVClient_UnregisterAtTVConnectionRequest');

/** @name TVClient_AddSongToPlaylistRequest отключение от TV Connection */
/** @name TVClient_AddSongToPlaylistRequest_Success отключение от TV Connection */
/** @name TVClient_AddSongToPlaylistRequest_Fail отключение от TV Connection */
Core.registerRequestPoint('TVClient_AddSongToPlaylistRequest');

/** @name TVClient_SyncRequest отключение от TV Connection */
/** @name TVClient_SyncRequest_Success отключение от TV Connection */
/** @name TVClient_SyncRequest_Fail отключение от TV Connection */
Core.registerRequestPoint('TVClient_SyncRequest');

/** @name TVClient_ScoreCounted */
Core.registerEventPoint('TVClient_ScoreCounted');

/** @name TV_PlaylistChanged */
Core.registerEventPoint('TV_PlaylistChanged');

/** @name TVClient_UpdateProfile */
Core.registerEventPoint('TVClient_UpdateProfile');

/**
 * @class
 * Класс объекта TVClient
 *
 */
TVClient = {
      tv_code      : null // код телевизора и собственно TVConnection
    , syncInterval : null
    , dt           : 0    // среднее измеренное время синхронизации
    , dt_values    : []   // последние 20 измеренных времен синхронизации
    , battle_state : 'none'

    /**
     * @function
     * Подписываем сервер на обработку событий и реквестов
     */
    , subscribeServer: function() {
        CatchEvent(TVClientCommutator.Start);
        var context = Core.fetchContext();

        var requests = [
              'TVClient_SyncRequest'
            , 'TVClient_UnregisterAtTVConnectionRequest'
            , 'TVClient_RegisterAtTVConnectionRequest'
            , 'TVClient_AddSongToPlaylistRequest'
        ];

        var events = [
              'TVClient_ScoreCounted'
            , 'TVClient_UpdateProfile'
        ];

        //подписка
        TVClientCommutator.subscribe_other_side(context.Commutator.connection, requests, {});
        TVClientCommutator.subscribe_other_side(context.Commutator.connection, events,   {});

        if( this.tv_code ) {
          this.registerAtTVConnection();
        }
    }

    /**
     * @function
     * Отключение от TVConnection
     *
     */
    , unRegisterAtTVConnection: function(cb, eb) {
        var _this = this;

        if( !TVClientCommutator.conn.subscriptions ){
            eb && eb();
            return false;
        }

        FireRequest(
            new TVClient_UnregisterAtTVConnectionRequest({
                  Device : _this.Device
                , tv_code: _this.tv_code
            })
            , function() {
                cb && cb();
                clearInterval(_this.syncInterval);
                TVClient.tv_code = null;
                cb && cb();
            }
            , function() {
                TVClient.tv_code = null;
                eb && eb();
            }
            , { TVConnection: { code: _this.tv_code } }
        )
    }

    , sendUpdateProfile: function(user_name, avatar) {
        var _this = this;

        FireEvent(
            new TVClient_UpdateProfile({
                  tv_code: _this.tv_code
                , Device : _this.Device
                , user_name: user_name
                , avatar: avatar
            })
            , { TVConnection: { code: _this.tv_code } }
        )
    }

    , onLostConnection: function() {
      CatchEvent(TVClientCommutator.ConnectionLost);

      if( this.syncInterval ) clearInterval(this.syncInterval);
    }

    /**
     * @function
     * Подключение к TVConnection
     *
     */
    , registerAtTVConnection: function(tv_code, Device, user_name, avatar) {
        var _this = this;

        console.log('registerAtTVConnection');

        if( tv_code ) {
          this.tv_code = tv_code;
        }

        if( Device ) {
          this.Device  = Device;
        }

        //todo: исправить на нормальную проверку
        if( !TVClientCommutator.conn.subscriptions ) return false;

        FireRequest(
            new TVClient_RegisterAtTVConnectionRequest({
                  tv_code  : _this.tv_code
                , Device   : _this.Device
                , user_name: user_name
                , avatar   : avatar
            })
            , function(data) {
                if( _this.syncInterval ) clearInterval(_this.syncInterval);

                var dt = 0, dt_samples = 0;

                //todo: очищать, если произошел реконнект
                _this.syncInterval = setInterval(function() {
                    var startRequestTime = +new Date();
                    FireRequest(
                          new TVClient_SyncRequest()
                        , function(data) {
                        
                            //var dt = ( +new Date() + startRequestTime ) / 2 - data.date;
                            //TVClient.dt_values.unshift(dt);
                            //while(TVClient.dt_values.length > 20) {
                            //    TVClient.dt_values.pop()
                            //}
                            //TVClient.dt = TVClient.dt_values.reduce(function(a,b){return a+b}) / TVClient.dt_values.length;
                            //console.log(data);
                            dt = (dt * dt_samples + (data.date - ( +new Date() + startRequestTime ) / 2)) / (++dt_samples)
                            dt_samples *= 0.9;
                            TVClient.dt = dt
                        }
                        , function() {}
                        , { TVConnection: { code: _this.tv_code } }
                    )
                }, 5000);
            }
            , function(){
                //alert('TVClient_RegisterAtTVConnectionRequest');
                //console.log(23)
            }
        )
    }

    , getTVTime: function (){
        return +new Date() + this.dt;
    }

    , getSongTime: function () {
        if(this._song_start_timestamp > 0) {
            return +new Date() + this.dt - this._song_start_timestamp;
        }
    }

    , _song_start_timestamp: 0

    , catchSongStartTime: function() {
        var event = CatchEvent(Battle_Started, Battle_Paused, Battle_Resumed, Battle_Finished, Battle_Stopped,
            TVClient_RegisterAtTVConnectionRequest_Success);

        if(event instanceof Battle_Started) {
            this._song_start_timestamp = event.timestamp;
        } else  if(event instanceof Battle_Resumed) {
            this._song_start_timestamp = event.timestamp - event.currentTime;
        } else  if(event instanceof TVClient_RegisterAtTVConnectionRequest_Success) {
            if(event.result.current_battle) {
                this._song_start_timestamp = event.result.current_battle.start_timestamp;
                if(event.result.current_battle.last_resume_timestamp) {
                    this._song_start_timestamp = event.result.current_battle.last_resume_timestamp - event.result.current_battle.currentTime;
                }
            }
        } else {
            this._song_start_timestamp = 0;
        }
    }


    /**
     * @function
     * Добавить песню в плейлист
     *
     */
    , addSongToPlaylist: function(song) {
        var _this = this;

        FireRequest(
              new TVClient_AddSongToPlaylistRequest(song)
            , function(data) {
                console.log(data);
            }
            , function() {}
            , { TVConnection: { code: _this.tv_code } }
        )
    }

    /**
     * @function
     * Обработка события от телевизора на обновления плейлиста
     *
     */
    , updatePlaylist: function() {
        var event = CatchEvent(TV_PlaylistChanged);

        console.log('updatePlaylist', event);
    }

    , sendScore: function(score) {
        var _this = this;

        FireEvent(
            new TVClient_ScoreCounted({
                  tv_code: _this.tv_code
                , Device : _this.Device
                , score: score })
            , { TVConnection: { code: _this.tv_code } }
        );
    }

    , onBattleCreated: function() {
      var event = CatchEvent(Battle_Created);
      this.battle_state = 'created';
    }

    , onBattleStarted: function() {
      var event = CatchEvent(Battle_Created);
      this.battle_state = 'started';       
    }

    , onBattlePaused: function() {
      var event = CatchEvent(Battle_Paused);
      this.battle_state = 'paused'; 
    }

    , onBattleFinished: function() {
      var event = CatchEvent(Battle_Finished);
      this.battle_state = 'finished';
    }

    , onBattleResumed: function() {
      var event = CatchEvent(Battle_Resumed);
      this.battle_state = 'resumed';
    }

    , onBattleStopped: function() {
      var event = CatchEvent(Battle_Stopped);
      this.battle_state = 'stopped';
    }

    , onBattleProgress: function() {
      var event = CatchEvent(Battle_Progress);

      console.log(event);
    }
    , onBattleCreated: function() {
        var event = CatchEvent(Battle_Created);
        this.battle_state = 'created';
    }

    , onBattleStarted: function() {
        var event = CatchEvent(Battle_Started);
        this.battle_state = 'started';
    }

    , onBattlePaused: function() {
        var event = CatchEvent(Battle_Paused);
        this.battle_state = 'paused';
    }

    , onBattleFinished: function() {
        var event = CatchEvent(Battle_Finished);
        this.battle_state = 'finished';
    }

    , onBattleResumed: function() {
        var event = CatchEvent(Battle_Resumed);
        this.battle_state = 'resumed';
    }

    , onBattleStopped: function() {
        var event = CatchEvent(Battle_Stopped);
        this.battle_state = 'stopped';
    }

};