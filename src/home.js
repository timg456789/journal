var AWS = require('aws-sdk');
var UrlParameter = require('journal-library/src/url-parameter');
var SearchDialog = require('./search-dialog');
var HomeSave = require('./home-save');
var SaveIndicator = require('./save-indicator');

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

        AWS.config.update({signatureVersion: 'v4'});

        s3 = new AWS.S3({
            accessKeyId: urlParams.accessKeyId,
            secretAccessKey: urlParams.secretAccessKey,
            region: 'us-east-1',
            computeChecksums: true
        });

        var esOptions = {
            protocol: 'https',
            endpoint: urlParams.endpoint,
            index: 'journal',
            docType: 'entry',
            region: 'us-east-1'
        };

        homeSave = new HomeSave(s3, urlParams.bucket, esOptions);

        var searchDialog = new SearchDialog();
        searchDialog.init(urlParams.endpoint, urlParams.index, esOptions.docType);

        homeSave.updateLocalCount();

        var saveIndicator = new SaveIndicator();
        saveIndicator.setConnectivityAvailable(navigator.onLine);
        if (navigator.onLine) {
            homeSave.saveAllToRemote();
            homeSave.loadEntries();
        }

        $('#input').keypress(function() {
            saveIndicator.setConnectivityUnsavedChanges();
            homeSave.saveInputToLocal();
        });

        saveButton.click(function () {
            homeSave.save();
        });

    };

}

module.exports = Home;
