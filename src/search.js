var request = require('request');

function Search() {
    'use strict';

    function isSuccessStatusCode(statusCode) {
        return statusCode > 199 && statusCode < 300;
    }

    function getPath(esOptions) {
        var mappedPath = esOptions.protocol + '://' +
            esOptions.endpoint + '/' +
            esOptions.index;

        if (esOptions.docType) {
            mappedPath += '/' + esOptions.docType;
        }

        if (esOptions.action) {
            mappedPath += '/' + esOptions.action;
        }

        return mappedPath;
    }

    this.create = function(esOptions, document, context) {
        var mappedPath = getPath(esOptions);

        request(
            {
                url: mappedPath,
                method: 'PUT',
                json: true,
                body: document
            },
            function (error, response, body) {
                if (!error && isSuccessStatusCode(response.statusCode)) {
                    context.succeed(body);
                } else {
                    var failMsg = JSON.stringify(error, 0, 4) +
                        JSON.stringify(response, 0, 4) +
                        JSON.stringify(body, 0, 4);
                    context.fail(failMsg);
                }
            }
        );
    };

    this.delete = function(esOptions, context) {
        var mappedPath = getPath(esOptions);

        request(
            {
                url: mappedPath,
                method: 'DELETE'
            },
            function (error, response, body) {
                if (!error && isSuccessStatusCode(response.statusCode)) {
                    context.succeed(body);
                } else {
                    var failMsg = JSON.stringify(error, 0, 4) +
                        JSON.stringify(response, 0, 4) +
                        JSON.stringify(body, 0, 4);
                    context.fail(failMsg);
                }
            }
        );
    };

    this.upload = function(esOptions, document, context) {
        var mappedPath = getPath(esOptions);
        mappedPath += '/' + esOptions.docTitle;

        request.post(
            {
                url: mappedPath,
                method: 'POST',
                json: true,
                body: document
            },
            function (error, response, body) {
                if (!error && isSuccessStatusCode(response.statusCode)) {
                    context.succeed(body);
                } else {
                    var failMsg = JSON.stringify(error, 0, 4) +
                        JSON.stringify(response, 0, 4) +
                        JSON.stringify(body, 0, 4);
                    context.fail(failMsg);
                }
            }
        );
    };

    this.search = function (esOptions, context) {

        var mappedPath = getPath(esOptions);

        var searchQuery = {};
        searchQuery.query = {};
        searchQuery.query.match = {};
        searchQuery.query.match['_all'] = esOptions.text;

        request.post(
            {
                url: mappedPath,
                method: 'POST',
                json: true,
                body: searchQuery
            },
            function (error, response, body) {
                if (!error && isSuccessStatusCode(response.statusCode)) {
                    context.succeed(body);
                } else {
                    var failMsg = JSON.stringify(error, 0, 4) +
                                    JSON.stringify(response, 0, 4) +
                                    JSON.stringify(body, 0, 4);
                    context.fail(failMsg);
                }
            }
        );

    };

}

module.exports = Search;
