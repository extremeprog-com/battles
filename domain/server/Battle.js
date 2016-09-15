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

Core.registerEventPoint('Battle_Stopped');

/** @name Battle_ParticipantListChanged */
Core.registerEventPoint('Battle_ParticipantListChanged');

/** @name Battle_RatingUpdated */
Core.registerEventPoint('Battle_RatingUpdated');


Battle = {
    /**
     * @function
     *
     */
    
    battleToTVConnection: {}
    
    , onPlayerInitSong: function() {
        var
              event   = CatchEvent(Song_Inited)
            , context = Core.fetchContext();

        console.log('TVConnection ->'.red + ' Battle_Created. Song ' + event.Song._self);

        this.battleToTVConnection[context.Commutator.connection.subscriptions['Battle_Created'][0].TVConnection.code] = {
              Song: event.Song
            , tone: event.tone
        };
        FireEvent(new Battle_Created({Song: event.Song, tone: event.tone}), context);
    }

    /**
     * @function
     *
     */
    , onPlayerSongStarted: function() {
        var
              event   = CatchEvent(Player_Start)
            , context = Core.fetchContext();

        console.log('TVConnection ->'.red + ' Battle_Started with timestamp ' + event.timestamp);

        if( this.battleToTVConnection[context.Commutator.connection.subscriptions['Battle_Started'][0].TVConnection.code] )
            this.battleToTVConnection[context.Commutator.connection.subscriptions['Battle_Started'][0].TVConnection.code].start_timestamp = event.timestamp;

        FireEvent(new Battle_Started({timestamp: event.timestamp}), context);
    }

    /**
     * @function
     *
     */
    , onPlayerSongPaused: function() {
        var
              event   = CatchEvent(Player_Pause)
            , context = Core.fetchContext();

        console.log('TVConnection ->'.red + ' Battle_Paused with timestamp ' + event.timestamp);

        FireEvent(new Battle_Paused({timestamp: event.timestamp}), context);
    }

    /**
     * @function
     *
     */
    , onPlayerSongResumed: function() {
        var
              event   = CatchEvent(Player_Resume)
            , context = Core.fetchContext();

        console.log('TVConnection ->'.red + ' Battle_Resumed with timestamp ' + event.timestamp);

        this.battleToTVConnection[context.Commutator.connection.subscriptions['Battle_Started'][0].TVConnection.code].last_resume_timestamp = event.timestamp;
        this.battleToTVConnection[context.Commutator.connection.subscriptions['Battle_Started'][0].TVConnection.code].currentTime = event.currentTime;

        FireEvent(new Battle_Resumed({timestamp: event.timestamp, currentTime: event.currentTime}), context);
    }

    /**
     * @function
     *
     */
    , onPlayerSongFinished: function() {
        var
              event   = CatchEvent(Player_Finish)
            , context = Core.fetchContext();

        console.log('TVConnection ->'.red + ' Battle_Finished');
        
        delete this.battleToTVConnection[context.Commutator.connection.subscriptions['Battle_Started'][0].TVConnection.code];
        
        console.log('TVConnection ->'.red + ' Battle_Finished with timestamp ' + event.timestamp);
        FireEvent(new Battle_Finished({timestamp: event.timestamp}), context);
    }

    /**
     * @function
     *
     */
    , onPlayerSongStop: function() {
        var
              event   = CatchEvent(Player_Stop)
            , context = Core.fetchContext();

        console.log('TVConnection ->'.red + ' Battle_Stopped with timestamp ' + event.timestamp);
        delete this.battleToTVConnection[context.Commutator.connection.subscriptions['Battle_Started'][0].TVConnection.code];
        FireEvent(new Battle_Stopped({timestamp: event.timestamp}), context);
    }
};