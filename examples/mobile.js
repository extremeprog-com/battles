$( document ).ready(function() {
    var Device = 'dd-ios-358' + ("" + Math.random()).substring(2, 9);

    $('#send_tv_code').click(function(){
        var tv_code = $('#tv_code').val();

        if( tv_code.length ) {
            TVClient.registerAtTVConnection(tv_code, Device, 'Sanka', 'http://oboi.ws/wallpapers/big_8852_oboi_doktor_haus_v_futbolke_so_zmejami_na_trosti.jpg');
        }
    });

    $('#addSong').click(function(){
        TVClient.addSongToPlaylist({song_id: 12345});
    });


    $('#disconnect').click(function(){
        TVClient.unRegisterAtTVConnection();
    });

    $('#countscore').click(function(){
        TVClient.sendScore(Math.random());
    });
});
