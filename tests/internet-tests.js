const PERSONAL = require('./personal.json');
var test = require('tape');
var Search = require('../../journal/src/search');
var DocumentFactory = require('../../journal/src/library/document-factory');
var DocumentSave = require('../../journal/src/document-save');
var DocumentDelete = require('../../journal/src/document-delete');
var S3Factory = require('./factories/s3-factory');

var endpoint = PERSONAL.endpoint;
var search = new Search();
var docFactory = new DocumentFactory();

var doc = docFactory.create('test doc');

function getEsOptions() {
    'use strict';
    return {
        protocol: 'https',
        endpoint: endpoint,
        index: 'journal',
        docType: PERSONAL.docType,
        region: 'us-east-1'
    };
}

test('document save', function (t) {
    'use strict';
    t.plan(1);

    var esOptions = getEsOptions();
    esOptions.docTitle = 'test doc';

    var s3 = new S3Factory().create();

    var context = {};
    context.succeed = function () {
        t.pass();
    };
    context.fail = function (failSaveSearch) {
        console.log('failure saving: ' + JSON.stringify(failSaveSearch, 0, 4));
        t.fail();
    };

    var documentSave = new DocumentSave(esOptions, s3, PERSONAL.bucket, context);
    console.log('saving: ' + doc.content);
    documentSave.save(doc);
});

test('elastic search', function (t) {
    'use strict';
    t.plan(1);

    var esOptions = getEsOptions();
    esOptions.action = '_search';
    esOptions.text = 'test doc';

    var context = {};
    context.succeed = function (result) {
        console.log(result.hits.total);
        t.ok(result.hits.total > 1, 'test doc found');
    };
    context.fail = function (result) {
        console.log(result);
        t.fail();
    };
    console.log('searching for: ' + esOptions.text);
    search.search(esOptions, context);

});

test('document delete', function(t) {
    'use strict';
    t.plan(1);

    var deleteKey = doc.time;
    var s3 = new S3Factory().create();
    var documentDelete = new DocumentDelete(s3, PERSONAL.bucket);

    var deletePromise = documentDelete.deletePromise(deleteKey);
    deletePromise.then(function (deleteResponse) {
        t.equal(deleteResponse.DeleteMarker, true, 'deleted ' + deleteKey + ' at version: ' + deleteResponse.VersionId);
    }).catch(function (err) {
        t.fail(err);
    });
});

