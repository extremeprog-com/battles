/** @name TV_CreateConnectionRequest создание TV Connection */
Core.registerRequestPoint('TV_CreateConnectionRequest');

/** @name TV_ReconnectRequest пересоединение TV к существующему TV Connection */
Core.registerRequestPoint('TV_ReconnectRequest');

/** @name TV_PlaylistChanged пересоединение TV к существующему TV Connection */
Core.registerEventPoint('TV_PlaylistChanged');



TV = {
      code        : null
    , participants: []
    , Device      : 'tv-7878299-' + ("" + Math.random()).substring(2, 8)
    , playlist    : []

    , createTVConnection: function() {
        CatchEvent(TVCommutator.Start);

        var context = Core.fetchContext();

        var requests = [
                  'TV_CreateConnectionRequest'
                , 'TV_ReconnectRequest'
            ]
            , events = [
                  'TV_PlaylistChanged'
                , 'Song_Inited'
                , 'Player_SongStarted'
                , 'Player_SongPaused'
                , 'Player_SongResumed'
                , 'Player_SongFinished'
                , 'Player_SongCancelled'
            ];

        TVCommutator.subscribe_other_side(context.Commutator.connection, events,   {});
        TVCommutator.subscribe_other_side(context.Commutator.connection, requests, {});

        FireRequest(
            new TV_CreateConnectionRequest({
                Device: TV.Device
                //, force: true
            })
            , function(data) {
                TV.code = data.code;
            }
        );
    }
    /**
     * @function
     * Файеринг события изменения плейлиста, после того, как клиент добавил песню
     *
     */
    , changePlaylist: function() {
        var
            request = CatchRequest(TVClient_AddSongToPlaylistRequest)
            , _this = this;

        return function(success) {
            _this.playlist.push(request.song_id);
            success();
            FireEvent(new TV_PlaylistChanged({ playlist: _this.playlist }), { TVConnection: { code: TV.code } });
        };
    }

    /**
     * @function
     * Ответ на реквест от сервера на синхронизацию по времени
     *
     * @returns {Function}
     */
    , syncWithServer: function() {
        var request = CatchRequest(TVConnection_SyncRequest);

        return function(success) {
            success(+new Date());
        }
    }

    /**
     * @function
     *
     */
    , getScore: function() {
       var event = CatchEvent(TVClient_ScoreCounted);

        console.log(event);
    }

    , listenBattleEvents: function() {
        var event = CatchEvent(
              Battle_Started
            , Battle_Created
            , Battle_Cancelled
            , Battle_Finished
            , Battle_Paused
            , Battle_Resumed
        );

        console.log('tv battle event:');
        console.log(event);
    }
};