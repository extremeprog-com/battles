/**
 * Functional test for LG
 * Check search
 *
 * Use PhantomJS
 */

var page = require('webpage').create();
var url  = 'http://battle.lo/test/mobile.html';
var tv_url  = 'http://battle.lo/test/tv.html';
var Util = require('./util.js');

page.onConsoleMessage = function(msg) {
    console.log('console> ' + msg);
};

page.onError = function(msg, trace) {
    console.log('error> ' + msg);
    if( trace && trace.length ) {
        var msgStack = [];
        trace.forEach(function(t) {
            msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
        });
    }
    console.error(msgStack.join('\n'));
    phantom.exit(1);
};

page.open(tv_url, function(status) {
    if( status == "success" ) {
        console.log('Battle test page loaded. Start checking TVClient connection...');
        checkConnection();
        //Util.makeSnapshot(); //-> use it only when you want to see the process in the browser
    }
});


/**
 * @function
 * Check for search is working
 *
 */
function checkConnection() {
    Util.waitFor(
        function() {
            return page.evaluate(function() {
                return ($('#code').html().length > 0);
            })
        }
        , function() {
            console.log('TVConnection created');
            page.open(url, function(status) {
                if( status == "success" ) {
                    console.log('Battle test page loaded. Start checking TVClient connection...');
                    //checkConnection();
                    //Util.makeSnapshot(); //-> use it only when you want to see the process in the browser
                }
            });
            //console.log('Exit');
            //phantom.exit();
        }
        , 5000
    );
}