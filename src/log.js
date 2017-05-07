var UrlParameter = require('./library/url-parameter');

function Log() {
    'use strict';

    function getUrlParam(param) {
        var urlParameter = new UrlParameter();
        var url = window.location.href;
        return urlParameter.getParameterByName(url, param);
    }

    this.add = function (msg) {
        console.log(msg);

        if (typeof window !== 'undefined'
            && getUrlParam('debugMode') == 'true') {
            $('#debug-console').append(msg);
        }
    };

}

module.exports = Log;