TVTemplate = {
    onTVConnectionCreated: function() {
        var event = Core.CatchEvent(TVConnection_Created, TVConnection_Restored);

        $('#participants_list').html(JSON.stringify(event.TVConnection.tvClients));
    }
    , participantListChanged: function() {
        var event = Core.CatchEvent(TVConnection_ParticipantListChanged);

        $('#participants_list').html(JSON.stringify(event.tvClients));
    }
    , setCode: function() {
        var event = Core.CatchEvent(TV_CreateConnectionRequest_Success);

        $('#code').html(event.result.code);
    }
    , playerControlsHandle: function() {
        var event = Core.CatchEvent(TV_CreateConnectionRequest_Success);

        $('#init') .click(function() { FireEvent(new Player_SongInited(),   { TVConnection: { code: TV.code } }); });
        $('#play') .click(function() { FireEvent(new Player_SongStarted(),  { TVConnection: { code: TV.code } }); });
        $('#pause').click(function() { FireEvent(new Player_SongPaused(),   { TVConnection: { code: TV.code } }); });
        $('#stop') .click(function() { FireEvent(new Player_SongFinished(), { TVConnection: { code: TV.code } }); });
    }
};