var Util = {
    /**
     * @function
     * Zen road to sync
     *
     * @param testFx
     * @param onReady
     * @param timeOutMillis
     */
    waitFor: function(testFx, onReady, timeOutMillis) {
        var
              maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000 //< Default Max Timout is 3s
            , start            = new Date().getTime()
            , condition        = false

            , interval         = setInterval(function() {
                if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                    // If not time-out yet and condition not yet fulfilled
                    condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
                } else {
                    if(!condition) {
                        // If condition still not fulfilled (timeout but condition is 'false')
                        console.log("'waitFor()' timeout. Exiting...");
                        phantom.exit(1);
                    } else {
                        // Condition fulfilled (timeout and/or condition is 'true')
                      //  console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                        typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                        clearInterval(interval); //< Stop this interval
                    }
                }
            }, 250); //< repeat check every 250ms
    }

    /**
     * @function
     * Make screen shot of the site and show it in the browser
     *
     */
    , makeSnapshot: function() {
        var
              process = require('system')
            , fs = require('fs')
            , file    = '/tmp/phantom-' + process.pid + '-screen'
            , opts    = { format: 'jpeg', quality: '70' };

        fs.copy(process.env.PROJECTPATH + '/integration/tests/snapshots.html', file + '.html');
        require('child_process').spawn('/usr/bin/open','file:///' + file + '.html');
        setInterval(function(){
            page.render(file + '.jpg', opts);
        }, 100);
    }
};


module.exports = Util;