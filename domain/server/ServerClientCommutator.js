/** @name TVClient_AddSongToPlaylistRequest */
/** @name TVClient_AddSongToPlaylistRequest_Success */
/** @name TVClient_AddSongToPlaylistRequest_Fail */
Core.registerRequestPoint('TVClient_AddSongToPlaylistRequest');

/** @name TVClient_RegisterAtTVConnectionRequest */
/** @name TVClient_RegisterAtTVConnectionRequest_Success */
/** @name TVClient_RegisterAtTVConnectionRequest_Fail */
Core.registerRequestPoint('TVClient_RegisterAtTVConnectionRequest');

/** @name TVClient_UnregisterAtTVConnectionRequest */
/** @name TVClient_UnregisterAtTVConnectionRequest_Success */
/** @name TVClient_UnregisterAtTVConnectionRequest_Fail */
Core.registerRequestPoint('TVClient_UnregisterAtTVConnectionRequest');

/** @name TVClient_SyncRequest */
/** @name TVClient_SyncRequest_Success */
/** @name TVClient_SyncRequest_Fail */
Core.registerRequestPoint('TVClient_SyncRequest');

/** @name TVCLient_UpdateProfile */
Core.registerEventPoint('TVClient_UpdateProfile');

/** @name TVClient_ScoreCounted */
Core.registerEventPoint('TVClient_ScoreCounted');

ServerClientCommutator = {
    __proto__        : ServerCommutator
    , waitingRequests: {}
    , connections    : {}

    , Init: new Core.EventPoint

    /**
     * @function
     * Запуск сокет-сервера
     *
     */
    , runServer: function() {
        CatchEvent(ServerClientCommutator.Init);

        this.sockjs_server = sockjs.createServer({sockjs_url: process.env.PROJECTPATH + "integration/lib/sockjs-0.3.js"});
        this.sockjs_server.installHandlers(BattleServer.server, { prefix: '/battle/tv_client' });
    }

    /**
     * @function
     * Инициализация коммутатора
     *
     */
    , runCommutatorWhenInit: function() {
        CatchEvent(ServerClientCommutator.Init);

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
                  TVClient_RegisterAtTVConnectionRequest_Success
                , TVClient_RegisterAtTVConnectionRequest_Fail
                , TVClient_UnregisterAtTVConnectionRequest_Success
                , TVClient_UnregisterAtTVConnectionRequest_Fail
                , TVClient_AddSongToPlaylistRequest_Success
                , TVClient_AddSongToPlaylistRequest_Fail
                , TVClient_SyncRequest_Success
                , TVClient_SyncRequest_Fail
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
                  Battle_Created
                , Battle_Started
                , Battle_Finished
                , Battle_Paused
                , Battle_Resumed
                , Battle_Stopped
                , TV_PlaylistChanged
            )
            , context = Core.fetchContext();

        this.sendEvent(event, context);
    }
};

