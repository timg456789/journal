
function Home() {

    this.init = function () {

        $('#input').keypress(function() {
            $('#save').addClass('btn-danger');
            $('#save').removeClass('btn-success');
        });

        $('#save').click(function () {

            const UrlParameter = require('url-parameter/src/url-parameter');
            var urlParameter = new UrlParameter();
            var url = window.location.href;

            var params = {};
            params.accessKeyId = urlParameter.getParameterByName(url, 'AccessKeyId');
            params.secretAccessKey = urlParameter.getParameterByName(url, 'SecretAccessKey');
            params.bucket = urlParameter.getParameterByName(url, 'Bucket');

            var AWS = require('aws-sdk');
            AWS.config.update(
                {
                    accessKeyId: params.accessKeyId,
                    secretAccessKey: params.secretAccessKey,
                    region: 'us-east-1'
                }
            );
            var s3 = new AWS.S3();

            var options = {};
            options.Bucket = params.bucket;
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