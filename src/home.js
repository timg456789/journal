
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

        var listParams = {};
        listParams.Bucket = urlParams.bucket;
        s3.listObjectsV2(listParams, function(err, data) {
            if (err) {
                console.log(err);
                return;
            }

            console.log(data);

            for(var i = 0; i < data.Contents.length; i++) {
                $('#journal-entries').append('<div>' +
                    data.Contents[i].Key +
                '</div>');
            }
        });

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
                }

            });

        });
    };

}

module.exports = Home;