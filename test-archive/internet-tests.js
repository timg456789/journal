var AWS = require('aws-sdk');
var test = require('tape');
var Search = require('../src/search');
var DocumentFactory = require('../src/document-factory');
var DocumentSave = require('../src/document-save');

var personal = require('../personal.json');
var endpoint = personal.endpoint;

var search = new Search();

test('document save', function (t) {
    'use strict';
    t.plan(1);

    var esOptions = {
        protocol: 'https',
        endpoint: endpoint,
        index: 'journal',
        docType: personal.docType,
        region: 'us-east-1',
        docTitle: 'test doc'
    }
    var s3 = new AWS.S3({
        accessKeyId: personal.accessKeyId,
        secretAccessKey: personal.secretAccessKey,
        region: 'us-east-1'
    });

    var context = {};
    context.succeed = function () {
        t.pass();
    };
    context.fail = function (failSaveSearch) {
        console.log('failure saving: ' + JSON.stringify(failSaveSearch, 0, 4));
        t.fail();
    };

    var docFactory = new DocumentFactory();
    var doc = docFactory.create('test doc');

    var documentSave = new DocumentSave(esOptions, s3, personal.bucket, context);
    documentSave.save(doc);
});

test('elastic search', function (t) {
    'use strict';
    t.plan(1);

    var esOptions = {
        protocol: 'https',
        endpoint: endpoint,
        index: 'journal',
        docType: 'test',
        action: '_search',
        region: 'us-east-1',
        text: 'test doc'
    };

    var context = {};
    context.succeed = function (result) {
        t.equal(result.hits.total, 1);
    };
    context.fail = function (result) {
        console.log(result);
        t.fail();
    };
    search.search(esOptions, context);

});
