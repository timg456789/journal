const cal = require('income-calculator/src/calendar');
var HomeController = require('./home-controller');
var homeController = new HomeController();

function getParameterByName(name) {
    'use strict';

    var url = location.href;
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
}

$(document).ready(function () {
    'use strict';

    var settings = {};
    var optionalOverride = getParameterByName('data');
    if (optionalOverride) {
        settings.s3ObjectKey = optionalOverride;
    }

    settings.pub = getParameterByName('pub');
    settings.priv = getParameterByName('priv');
    settings.s3Bucket = getParameterByName('s3Bucket');
    homeController.init(settings);

    $('.alert-dismissible > button.close').click(function () {
        $(this).parent().remove();
    });

});
