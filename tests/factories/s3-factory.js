const AWS = require('aws-sdk');
const PERSONAL = require('../personal.json');

function S3Factory() {
    'use strict';

    this.create = function () {
        AWS.config.update({signatureVersion: 'v4'});
        var s3 = new AWS.S3({
            accessKeyId: PERSONAL.accessKeyId,
            secretAccessKey: PERSONAL.secretAccessKey,
            region: 'us-east-1',
            computeChecksums: true
        });
        return s3;
    };

}

module.exports = S3Factory;
