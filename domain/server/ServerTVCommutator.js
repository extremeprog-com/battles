/** @name TV_CreateConnectionRequest */
/** @name TV_CreateConnectionRequest_Success */
/** @name TV_CreateConnectionRequest_Fail */
Core.registerRequestPoint('TV_CreateConnectionRequest');

/** @name TV_ReconnectRequest */
/** @name TV_ReconnectRequest_Success */
/** @name TV_ReconnectRequest_Fail */
Core.registerRequestPoint('TV_ReconnectRequest');

/** @name TVClient_AddSongToPlaylistRequest */
/** @name TVClient_AddSongToPlaylistRequest_Success */
/** @name TVClient_AddSongToPlaylistRequest_Fail */
Core.registerRequestPoint('TVClient_AddSongToPlaylistRequest');


/** @name TV_PlaylistChanged */
Core.registerEventPoint('TV_PlaylistChanged');

/** @name Song_Inited */
Core.registerEventPoint('Song_Inited');

/** @name Player_SongStarted */
Core.registerEventPoint('Player_Start');

/** @name Player_SongPaused */
Core.registerEventPoint('Player_Pause');

/** @name Player_SongResumed */
Core.registerEventPoint('Player_Resume');

/** @name Player_SongFinished */
Core.registerEventPoint('Player_Finish');

/** @name Player_SongCancelled */
Core.registerEventPoint('Player_Cancel');

/** @name Player_SongStop */
Core.registerEventPoint('Player_Stop');

/** @name TVClient_ScoreCounted */
Core.registerEventPoint('TVClient_ScoreCounted');

/**
 * @class
 *
 */
ServerTVCommutator = {
      __proto__ : ServerCommutator
    , waitingRequests: {} // очередь соединений, которые ждут ответа на реквест
    , connections: {}

    , Init: new Core.EventPoint

    /**
     * @function
     *
     * Запускаем сокет-сервер
     */
    , runServer: function() {
        Core.CatchEvent(ServerTVCommutator.Init);

        this.sockjs_server = sockjs.createServer({sockjs_url: process.env.PROJECTPATH + "integration/lib/sockjs-0.3.js"});
        this.sockjs_server.installHandlers(BattleServer.server, { prefix: '/battle/tv' });
    }
    /**
     * @function
     *
     * Запускаем коммутатор и читаем входящие сообщения
     */
    , runCommutatorWhenInit: function() {
        CatchEvent(ServerTVCommutator.Init);

        this.runCommutator();
    }

    /**
     * @function
     *
     * Обработчик событий от Server
     */
    , listenEvents: function() {
        var
            event = CatchEvent(
                  TV_CreateConnectionRequest_Success
                , TV_CreateConnectionRequest_Fail
                , TV_ReconnectRequest_Success
                , TV_ReconnectRequest_Fail
            )
            , context = Core.fetchContext();

        this.sendEventOnRequest(event, context);
    }

    /**
     * @function
     * Send events from Server to TV or Clients
     *
     */
    , sendEvents: function() {
        var
            event = CatchEvent(
                  TVConnection_ParticipantListChanged
                , TVConnection_Created
                , TVConnection_Restored
                , TVClient_ScoreCounted
                , Battle_Created
                , Battle_Started
                , Battle_Finished
                , Battle_Paused
                , Battle_Resumed
                , Battle_Stopped
            )
            , context = Core.fetchContext();

        this.sendEvent(event, context);
    }

    /**
     * @function
     * Отправка реквестов на телевизор
     *
     * @returns {Function}
     */
    , sendRequests: function() {
        var
            request = CatchRequest(
                TVConnection_SyncRequest
            )
             , context = Core.fetchContext()
            , _this   = this;

        return function(success, fail) {
            request._reqid = ("" + Math.random()).substring(2, 9);
            _this.sendRequest(request, context);
            _this.waitingRequests[request._request + request._reqid] = { request: request, success: success, fail: fail };
        }
    }

    /**
     * @function
     * Сквозная отправка реквестов на телевизор
     *
     */
    , handleRequestsOverCommutators: function() {
        var
            request = CatchRequest(
                TVClient_AddSongToPlaylistRequest
            )
            , context = Core.fetchContext();

        this.sendRequest(request, context);
    }

    /**
     * @function
     * Обработка удачных событий на реквесты
     *
     */
    , catchResponseSuccessEvent: function() {
        var event = CatchEvent(
            TVConnection_SyncRequest_Success
        );

        this.handleSuccessEventsOnRequests(event);
    }

    /**
     * @function
     * Обработка неудачных событий на реквесты
     */
    , catchResponseFailEvent: function() {
        var event = CatchEvent(
            TVConnection_SyncRequest_Fail
        );

        this.handleFailEventsOnRequests(event);
    }
};
