var Home = require('./home');
var Log = require('./log');

$(document).ready(function () {
    'use strict';

    var myFirstPromise = new Promise( function (resolve, reject) {
        // We call resolve(...) when what we were doing async succeeded, and reject(...) when it failed.
        // In this example, we use setTimeout(...) to simulate async code.
        // In reality, you will probably be using something like XHR or an HTML5 API.
        setTimeout(function(){
            resolve("Success!");
        }, 250);
    });

    myFirstPromise.then(function (successMessage) {
        // successMessage is whatever we passed in the resolve(...) function above.
        // It doesn't have to be a string, but if it is only a succeed message, it probably will be.
        new Log().add("Yay! " + successMessage);
    });

    var home = new Home();
    home.init();
});
