(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function UrlParameter () {

    this.getParameterByName = function (url, name) {
        'use strict';

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




},{}],2:[function(require,module,exports){
const Home = require('./home');

$(document).ready(function () {
    'use strict';

    var home = new Home();
    home.init();

});

},{"./home":3}],3:[function(require,module,exports){

function Home() {

    this.init = function () {

        $('#save').click(function () {

            const UrlParameter = require('url-parameter/src/url-parameter');
            var urlParameter = new UrlParameter();
            var url = window.location.href;

            var accessKeyId = urlParameter.getParameterByName(url, 'AccessKeyId');
            var secretAccessKey = urlParameter.getParameterByName(url, 'SecretAccessKey');


            console.log(accessKeyId);
            console.log(secretAccessKey);

        });
    };

}

module.exports = Home;
},{"url-parameter/src/url-parameter":1}]},{},[2]);
