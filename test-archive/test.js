var test = require('tape');
var UrlParameter = require('url-parameter/src/url-parameter');

test('pluses are not converted to spaces', function (t) {
    'use strict';
    t.plan(1);

    var urlParameter = new UrlParameter();

    t.equal(
        urlParameter.getParameterByName(
            'file:///C:/Users/random/Desktop/projects/journal/index.html?testing1234=testing1+2', 'testing1234'),
        'testing1+2'); // super important, because aws access keys have literal pluses and I want to see the key in the url in plain text.
});
