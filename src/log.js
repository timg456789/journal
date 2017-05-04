var UrlParameter = require('url-parameter/src/url-parameter');

function Log() {

    function getUrlParam(param) {
        var urlParameter = new UrlParameter();
        var url = window.location.href;
        return urlParameter.getParameterByName(url, param);
    }

    this.add = function (msg) {
        console.log(msg);

        var debugMode = getUrlParam('debugMode') == 'true';
        if (debugMode) {
            $('#debug-console').append(msg);
        }
    };

}

module.exports = Log;