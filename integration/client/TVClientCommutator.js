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

/** @name Battle_Progress */
Core.registerEventPoint('Battle_Progress');

/** @name Battle_Stopped */
Core.registerEventPoint('Battle_Stopped');

/** @name Battle_ParticipantListChanged */
Core.registerEventPoint('Battle_ParticipantListChanged');

/** @name Battle_RatingUpdated */
Core.registerEventPoint('Battle_RatingUpdated');


/**
 * Объект коммутатора на стороне TVClient
 *
 */
TVClientCommutator = {
    __proto__: BrowserCommutator

    , waitingRequests: {}

    , Init          : new Core.EventPoint()
    , Start         : new Core.EventPoint()
    , ConnectionLost: new Core.EventPoint()

    , url: 'https://battle.karaoke.ru/battle/tv_client'
    , state: new Core.state('Init', 'Connected', 'Disconnected')
    /**
     * @function
     * Инициализация коммутатора
     *
     */
    , runCommutatorWhenInit: function() {
        CatchEvent(TVClientCommutator.Init);

        this.runCommutator();
    }
    /**
     * @function
     * Ловим все реквесты, пришедшие от TVClient и пересылаем на сервер
     *
     * @returns {Function}
     */
    , catchAndSendRequest: function() {
        var
              request = CatchRequest(
                    TVClient_RegisterAtTVConnectionRequest
                  , TVClient_UnregisterAtTVConnectionRequest
                  , TVClient_AddSongToPlaylistRequest
                  , TVClient_SyncRequest
              )
            , _this   = this
            , context = Core.fetchContext();

        return function(success, fail) {
            request._reqid = ("" + Math.random()).substring(2, 9);
            _this.sendRequest(request, context);
            _this.waitingRequests[request._request + request._reqid] = {request: request, success: success, fail: fail};
        };
    }
    /**
     * @function
     * Ловим ивенты и пересылаем их на сервер
     *
     */
    , catchAndSendEvents: function() {
        var
            event = CatchEvent(
                  TVClient_ScoreCounted
                , TVClient_UpdateProfile
            )
            , context = Core.fetchContext();

        this.sendEvent(event, context);
    }
    /**
     * @function
     * Обрабатываем удачные ответы на реквесты
     */
    , catchResponseSuccessEvent: function() {
        var event = CatchEvent(
              TVClient_RegisterAtTVConnectionRequest_Success
            , TVClient_UnregisterAtTVConnectionRequest_Success
            , TVClient_AddSongToPlaylistRequest_Success
            , TVClient_SyncRequest_Success
        );

        this.handleSuccessEventsOnRequests(event);
    }
    /**
     * @function
     * Обрабатываем неудачные ответы на реквесты
     */
    , catchResponseFailEvent: function() {
        var event = CatchEvent(
              TVClient_RegisterAtTVConnectionRequest_Fail
            , TVClient_UnregisterAtTVConnectionRequest_Fail
            , TVClient_AddSongToPlaylistRequest_Fail
            , TVClient_SyncRequest_Fail
        );

        this.handleFailEventsOnRequests(event);
    }
};