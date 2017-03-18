
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
                $('#journal-entries').append(
                    '<div class="journal-entry-listing">' +
                    data.Contents[objectIndex].Key +
                    '</div>');
            }

            $('#journal-entries').append(
                '<div class="journal-entry-listing">' +
                '<div class="view-more-journal-entries">View More</div>' +
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