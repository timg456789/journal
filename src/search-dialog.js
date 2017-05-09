var SearchEngine = require('./search');
var Log = require('./Log');

function SearchDialog() {
    'use strict';

    function insertResult(searchResult) {
        var source = searchResult['_source'];
        var entryText = JSON.stringify(source, 0, 4);
        var result = $('<div>' + entryText + '</div>');
        $('#search-results').append(result);
    }

    this.init = function (endpoint, index, docType) {
        $(function () { // There is something occurring with the nesting even though everything is already wrapped by this same ready function.
            $('[data-toggle="popover"]').popover();
        });
        var searchInputHtml = '<input type="text" id="search-input" />';
        searchInputHtml += '<div id="search-results"></div>';
        var searchPopOverOptions = {
            "title": "Search",
            "content": searchInputHtml,
            "html": true
        };

        $('#search').popover(searchPopOverOptions)
            .data('bs.popover')
            .tip().addClass('search-popover');
        $('#search').click(function () {
            $('#search').popover('show');
            $('#search-input').focus();

            $('#search-input').keyup(function () {
                var searchText = $('#search-input').val();

                var searchEngine = new SearchEngine();

                var esOptions = {
                    protocol: 'https',
                    endpoint: endpoint,
                    index: index,
                    docType: docType,
                    action: '_search',
                    region: 'us-east-1',
                    text: searchText
                };
                var context = {};
                context.succeed = function (result) {
                    $('#search-results').empty();
                    var i;
                    if (result.hits.total > 0) {
                        for (i = 0; i < result.hits.hits.length; i += 1) {
                            insertResult(result.hits.hits[i]);
                        }
                    }
                };
                context.fail = function (result) {
                    var log = new Log();
                    log.add('search error: ' + JSON.stringify(result));
                };
                searchEngine.search(esOptions, context);
            });
        });
    };

}

module.exports = SearchDialog;
