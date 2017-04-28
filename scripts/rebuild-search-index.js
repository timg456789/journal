const AWS = require('aws-sdk');
const Search = require('../src/search');
const search = new Search();
const DocumentFactory = require('../src/document-factory');
const documentFactory = new DocumentFactory();
const personal = require('../personal.json');

AWS.config.update(
    {
        accessKeyId: personal.accessKeyId,
        secretAccessKey: personal.secretAccessKey,
        region: 'us-east-1'
    }
);

var s3 = new AWS.S3();

var esOptions = {
    protocol: 'https',
    endpoint: personal.endpoint,
    index: 'journal',
    region: 'us-east-1'
};

var uploadCb = {
    fail: function (failResult) {
        console.log('failed to upload document: ' + JSON.stringify(failResult))
    },
    succeed: function (result) {
        console.log('created document for search');
    }
};

function getS3Cb(getParams) {
    return function () {
        s3.getObject(getParams, function (err, data) {
            if (err) {
                console.log('failed to get object for index: ' + getParams.Key);
            } else {
                var uploadOptions = {
                    protocol: 'https',
                    endpoint: personal.endpoint,
                    index: 'journal',
                    docType: 'entry',
                    region: 'us-east-1',
                    docTitle: getParams.Key
                };
                search.upload(uploadOptions, JSON.parse(data.Body), uploadCb);
            }
        });
    };
}

var listObjectsCb = function(err, s3ObjectData) {
    for(var objectIndex = 0; objectIndex < s3ObjectData.Contents.length; objectIndex++) {
        var getParams = {};
        getParams.Bucket = personal.bucket;
        getParams.Key = s3ObjectData.Contents[objectIndex].Key;
        s3.getObject(getParams, getS3Cb(getParams));
    }
};

var createCb = {
    fail: function (failCreateResult) {
        console.log('failed to create: ' + JSON.stringify(failCreateResult))
    },
    succeed: function (result) {
        console.log('created index: ' + esOptions.index);
        var listParams = {};
        listParams.Bucket = personal.bucket;
        listParams.MaxKeys = 1000;

        console.log('listing');
        s3.listObjectsV2(listParams, listObjectsCb);
    }
};

var deleteCb = {
    fail: function (failDeleteResult) {
        console.log('failed to delete: ' + JSON.stringify(failDeleteResult));
    },
    succeed: function (result) {
        console.log('deleted index: ' + esOptions.index);

        var indexOptions = {};
        indexOptions.settings = {};
        indexOptions.settings.number_of_shards = 5;
        indexOptions.settings.number_of_replicas = 2;

        search.create(esOptions, indexOptions, createCb);
    }
};
search.delete(esOptions, deleteCb);


