const test = require('tape');
const UrlParameter = require('../src/url-parameter');
const Md5 = require('journal-library/src/md5');
var DocumentFactory = require('../src/library/document-factory');

test('pluses are not converted to spaces', function (t) {
    'use strict';
    t.plan(1);

    var urlParameter = new UrlParameter();
    var value = urlParameter.getParameterByName(
        'file:///C:/Users/random/Desktop/projects/journal/index.html?testing1234=testing1+2',
        'testing1234'
    );

    t.equal(value, 'testing1+2');
});

test('hash test', function (t) {
    'use strict';
    t.plan(1);

    var md5 = new Md5();

    t.equal(md5.create('testing'),
            'ae2b1fca515949e5d54fb22b8ed95575');
});

test('hash protocol', function (t) {
    'use strict';
    t.plan(1);

    var md5 = new Md5();

    var content = 'testing';
    var time = '2017-05-07T04:07:07.469Z';
    var hash = md5.create(content + time);

    t.equal(hash, '61522e4123d94b98275ef1a09aeb8799');
});

test('doc hash', function (t) {
    'use strict';
    t.plan(1);

    var docFactory = new DocumentFactory();
    var doc = docFactory.create('testing', '2017-05-07T04:07:07.469Z');

    t.equal(doc.hash, '61522e4123d94b98275ef1a09aeb8799');
});

