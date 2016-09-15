/** @name TVConnection_ParticipantListChanged */
Core.registerEventPoint('TVConnection_ParticipantListChanged');

/** @name TVConnection_Restored */
Core.registerEventPoint('TVConnection_Restored');

/** @name TVConnection_Created */
Core.registerEventPoint('TVConnection_Created');

/** @name TVClient_AddSongToPlaylistRequest */
/** @name TVClient_AddSongToPlaylistRequest_Success */
/** @name TVClient_AddSongToPlaylistRequest_Fail */
Core.registerRequestPoint('TVClient_AddSongToPlaylistRequest');

/** @name TVConnection_SyncRequest */
/** @name TVConnection_SyncRequest_Success */
/** @name TVConnection_SyncRequest_Fail */
Core.registerRequestPoint('TVConnection_SyncRequest', {log: false});

/** @name TV_PlaylistChanged */
Core.registerEventPoint('TV_PlaylistChanged');

/** @name TVClient_ScoreCounted */
Core.registerEventPoint('TVClient_ScoreCounted');

/** @name Battle_Created */
Core.registerEventPoint('Battle_Created');

/** @name Battle_Started */
Core.registerEventPoint('Battle_Started');

/** @name Battle_Paused */
Core.registerEventPoint('Battle_Paused');

/** @name Battle_Resumed */
Core.registerEventPoint('Battle_Resumed');

/** @name Battle_Finished */
Core.registerEventPoint('Battle_Finished');

/** @name Battle_Cancelled */
Core.registerEventPoint('Battle_Progress');

Core.registerEventPoint('Battle_Stopped');

/** @name Battle_RatingUpdated */
Core.registerEventPoint('Battle_RatingUpdated');

TVCommutator = {
    __proto__: BrowserCommutator

    , waitingRequests: {}

    , Init : new Core.EventPoint()
    , Start: new Core.EventPoint()
    , ConnectionLost: new Core.EventPoint()

    //, url: 'https://battle.karaoke.ru/battle/tv'
    , url: 'https://battle.karaoke.ru/battle/tv'
    //, url: 'http://battle.lo/battle/tv'
    
    , state: new Core.state('Init', 'Connected', 'Disconnected')
    /**
     * @function
     * Запуск коммутатора при инициализации
     *
     */
    , runCommutatorWhenInit: function() {
        CatchEvent(Device_Started);

        this.runCommutator();
    }

    /**
     * @function
     * Пересылаем реквесты на сервер
     *
     * @returns {Function}
     */
    , catchRequest: function() {
        var
            request = CatchRequest(
                TV_CreateConnectionRequest
              , TV_ReconnectRequest
            )
            , _this   = this
            , context = Core.fetchContext();

        return function(success, fail) {
            request._reqid = ("" + Math.random()).substring(2, 9);

            _this.sendRequest(request, context);
            _this.waitingRequests[request._request + request._reqid] = { request: request, success: success, fail: fail };
        }
    }

    /**
     * @function
     * Пересылаем ивенты на сервер
     *
     */
    , catchEvent: function() {
        var
            event = CatchEvent(
                  TV_PlaylistChanged
                , Song_Inited
                , Player_Start
                , Player_Pause
                , Player_Resume
                , Player_Stop
                , Player_Finish
            )
            , context = Core.fetchContext();

        console.log(event);

        this.sendEvent(event, { TVConnection: { code: TV.code } });
    }

    /**
     * @function
     * Обработка событий на удачную отработку реквеста сервером
     *
     */
    , catchResponseSuccessEvent: function() {
        var event = CatchEvent(
              TV_CreateConnectionRequest_Success
            , TV_ReconnectRequest_Success
        );

        this.handleSuccessEventsOnRequests(event);
    }

    /**
     * @function
     * Обработка событий на удачную отработку реквеста сервером
     *
     */
    , catchResponseFailEvent: function() {
        var event = CatchEvent(
              TV_CreateConnectionRequest_Fail
            , TV_ReconnectRequest_Fail
        );

        this.handleFailEventsOnRequests(event);
    }

    /**
     * @function
     * Обработка реквестов от сервера
     */
    , listenEventFromRequests: function() {
        var
            event = CatchEvent(
                  TVConnection_SyncRequest_Success
                , TVConnection_SyncRequest_Fail
                , TVClient_AddSongToPlaylistRequest_Success
                , TVClient_AddSongToPlaylistRequest_Fail
            )
            , context = Core.fetchContext();

        this.waitingRequests[event._event.replace(/_(Success|Fail)$/, '') + event._reqid].send(JSON.stringify([[event], context]));
        delete this.waitingRequests[event._event.replace(/_(Success|Fail)$/, '') + event._reqid];
    }
};