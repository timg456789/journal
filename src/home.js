
function Home() {

    function getUrlParam(param) {
        const UrlParameter = require('url-parameter/src/url-parameter');
        var urlParameter = new UrlParameter();
        var url = window.location.href;
        return urlParameter.getParameterByName(url, param);
    }

    function getUrlParams() {
        var urlParams = {};
        urlParams.accessKeyId = getUrlParam('AccessKeyId');
        urlParams.secretAccessKey = getUrlParam('SecretAccessKey');
        urlParams.bucket = getUrlParam('Bucket');
        return urlParams;
    }

    function getEntryClick(s3, getParams) {
        return function () {
            console.log(getParams.Key);
            s3.getObject(getParams, function (err, data) {
                console.log(err);
                console.log(data);
                if (err) {
                    $('#input').val(err);
                } else {
                    $('#input').val(data.Body);
                }
            });
        };
    }

    function loadEntries(s3, bucket, continuationToken) {
        $('#journal-entries').empty();
        var listParams = {};
        listParams.Bucket = bucket;
        listParams.MaxKeys = 6;
        if (continuationToken) {
            console.log(continuationToken);
            listParams.ContinuationToken = continuationToken;
        }
        s3.listObjectsV2(listParams, function(err, data) {
            if (err) {
                console.log(err);
                return;
            }

            console.log(data);
            continuationToken = data.NextContinuationToken;
            console.log(continuationToken);

            var objectIndex = 0;
            for(objectIndex; objectIndex < data.Contents.length; objectIndex++) {
                var entryId = 'entry-key-' + data.Contents[objectIndex].Key;
                var entry = $('<button id="' + entryId + '" ' +
                    'class="btn btn-default journal-entry-listing">' +
                    data.Contents[objectIndex].Key +
                    '</button>');
                $('#journal-entries').append(entry);

                var getParams = {};
                getParams.Bucket = bucket;
                getParams.Key = data.Contents[objectIndex].Key;
                console.log('adding click: ' + data.Contents[objectIndex].Key);
                entry.click(getEntryClick(s3, getParams));
            }

            $('#journal-entries').append(
                '<div class="journal-entry-listing">' +
                '<button class="btn btn-primary view-more-journal-entries">View More</button>' +
                '</div>');

            $('.view-more-journal-entries').click(function () {
                loadEntries(s3, bucket, continuationToken);
            });

        });
    }

    this.init = function () {
        var urlParams = getUrlParams();

        var AWS = require('aws-sdk');
        AWS.config.update(
            {
                accessKeyId: urlParams.accessKeyId,
                secretAccessKey: urlParams.secretAccessKey,
                region: 'us-east-1'
            }
        );
        var s3 = new AWS.S3();

        loadEntries(s3, urlParams.bucket);

        $('#input').keypress(function() {
            $('#save').addClass('btn-danger');
            $('#save').removeClass('btn-success');
        });

        $('#save').click(function () {
            var options = {};
            options.Bucket = urlParams.bucket;
            options.Key = new Date().toISOString();
            options.Body = $('#input').val().trim();

            s3.upload(options, function (err, response) {
                if (err) {
                    console.log('failure saving settings: ' + JSON.stringify(err, 0, 4));
                } else {
                    $('#save').addClass('btn-success');
                    $('#save').removeClass('btn-danger');
                    console.log(JSON.stringify(response));
                    loadEntries(s3, urlParams.bucket);
                }

            });

        });
    };

}

module.exports = Home;
