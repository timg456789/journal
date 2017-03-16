
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