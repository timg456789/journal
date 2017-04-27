var AWS = require('aws-sdk');
var UrlParameter = require('url-parameter/src/url-parameter');
var SearchDialog = require('./search-dialog');
var HomeSave = require('./home-save');

function Home() {
    'use strict';

    var s3;
    var homeSave;
    var saveButton = $('#save');

    function getUrlParam(param) {
        var urlParameter = new UrlParameter();
        var url = window.location.href;
        return urlParameter.getParameterByName(url, param);
    }

    function getUrlParams() {
        var urlParams = {};
        urlParams.accessKeyId = getUrlParam('AccessKeyId');
        urlParams.secretAccessKey = getUrlParam('SecretAccessKey');
        urlParams.bucket = getUrlParam('Bucket');
        urlParams.endpoint = getUrlParam('SearchEndpoint');
        urlParams.index = getUrlParam('SearchIndex');
        return urlParams;
    }

    this.init = function () {
        var urlParams = getUrlParams();

        s3 = new AWS.S3({
            accessKeyId: urlParams.accessKeyId,
            secretAccessKey: urlParams.secretAccessKey,
            region: 'us-east-1'
        });

        homeSave = new HomeSave(urlParams.endpoint, s3, urlParams.bucket);

        var searchDialog = new SearchDialog();
        searchDialog.init(urlParams.endpoint, urlParams.index);

        homeSave.updateLocalCount();
        homeSave.setConnectivityAvailable(navigator.onLine);
        if (navigator.onLine) {
            homeSave.saveAllToRemote();
            homeSave.loadEntries();
        }

        $('#input').keypress(function() {
            homeSave.setConnectivityUnsavedChanges();
        });

        saveButton.click(function () {
            homeSave.save();
        });

    };

}

module.exports = Home;
