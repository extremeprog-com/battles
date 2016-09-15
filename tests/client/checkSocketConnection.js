describe('Socket Connection test', function() {
    it('should be created', function(done) {
        var conn = new SockJS('http://battle.lo/battle/tv');

        conn.onopen = function()  {
            done();
        };
    })
});