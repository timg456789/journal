const test = require('tape');
const UrlParameter = require('url-parameter/src/url-parameter');
const urlParameter = new UrlParameter();
const url = 'file:///C:/Users/random/Desktop/projects/journal/index.html?testing1234=testing1+2';

test('pluses are not converted to spaces', function (t) {
    t.plan(1);

    t.equal(
        urlParameter.getParameterByName(url, 'testing1234'),
        'testing1+2'); // super important, because aws access keys have literal pluses and I want to see the key in the url in plain text.
});
