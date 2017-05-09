function UrlParameter() {
    'use strict';

    this.getParameterByName = function (url, name) {
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
        var results = regex.exec(url);
        if (!results) {
            return null;
        }
        if (!results[2]) {
            return '';
        }
        return results[2];
    };

}

module.exports = UrlParameter;
