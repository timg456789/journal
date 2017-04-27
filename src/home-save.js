var DocumentSave = require('./document-save');
var DocumentFactory = require('./document-factory');

function HomeSave(endpoint, s3, bucket) {
    'use strict';

    var that = this;
    var saveElement = $('#save');

    var esOptions;
    esOptions = {
        protocol: 'https',
        endpoint: endpoint,
        index: 'journal',
        docType: 'entry',
        region: 'us-east-1'
    };

    function removeFromLocal(itemKey) {
        console.log('removing locally: ' + itemKey);
        localStorage.removeItem(itemKey);

        that.updateLocalCount();
    }

    function saveToLocal(doc) {
        var docJson = JSON.stringify(doc);
        console.log('saving locally: ' + docJson);
        localStorage.setItem(doc.time, docJson);

        that.updateLocalCount();
        that.setConnectivitySavedToLocal();
    }

    function showEntryInInput(s3, getParams) {
        return function () {
            s3.getObject(getParams, function (err, data) {
                if (err) {
                    $('#input').val(err);
                } else {
                    var jsonBody = JSON.parse(data.Body);
                    $('#input').val(jsonBody.content);
                }
            });
        };
    }

    function saveToRemote(doc) {
        var context = {};
        context.succeed = function () {
            console.log('setting saved to remote');
            that.setConnectivitySavedToRemote();
            removeFromLocal(doc.time);
        };
        context.fail = function (failSaveSearch) {
            console.log('failure saving: ' + JSON.stringify(failSaveSearch, 0, 4));
        };

        var documentSave = new DocumentSave(esOptions, s3, bucket, context);
        documentSave.save(doc);
    }

    this.setConnectivityAvailable = function (available) {
        var className = available ? 'btn-success' : 'btn-danger';
        this.setConnectivity(className);
    };

    this.setConnectivitySavedToRemote = function () {
        this.setConnectivity('btn-primary');
    };

    this.setConnectivitySavedToLocal = function () {
        this.setConnectivity('btn-info');
    };

    this.setConnectivityUnsavedChanges = function () {
        this.setConnectivity('btn-warning');
    };

    this.setConnectivity = function (newClass) {
        saveElement.removeClass('btn-warning');
        saveElement.removeClass('btn-success');
        saveElement.removeClass('btn-danger');
        saveElement.removeClass('btn-info');
        saveElement.addClass(newClass);
    };

    this.loadEntries = function (continuationToken) { // This could really move out of here into its own class and component.
        $('#journal-entries').empty();
        var listParams = {};
        listParams.Bucket = bucket;
        listParams.MaxKeys = 100;
        if (continuationToken) {
            listParams.ContinuationToken = continuationToken;
        }
        s3.listObjectsV2(listParams, function(err, data) {
            if (err) {
                console.log('error listing objects: ' + JSON.stringify(err));
                return;
            }

            continuationToken = data.NextContinuationToken;

            var objectIndex;
            var getParams;
            var entryId;
            var entry;

            for(objectIndex = 0; objectIndex < data.Contents.length; objectIndex +=1) {
                entryId = 'entry-key-' + data.Contents[objectIndex].Key;
                entry = $('<button id="' + entryId + '" ' +
                    'class="btn btn-default journal-entry-listing">' +
                    data.Contents[objectIndex].Key +
                    '</button>');
                $('#journal-entries').append(entry);

                getParams = {};
                getParams.Bucket = bucket;
                getParams.Key = data.Contents[objectIndex].Key;
                entry.click(showEntryInInput(s3, getParams));
            }

            $('#journal-entries').append(
                '<div class="journal-entry-listing">' +
                '<button class="btn btn-primary view-more-journal-entries">View More</button>' +
                '</div>');

            $('.view-more-journal-entries').click(function () {
                that.loadEntries(continuationToken);
            });

        });
    };

    this.saveAllToRemote = function () {
        var itemKey;
        var i;
        var doc;
        var localKeys = Object.keys(localStorage);

        for (i = 0; i < localKeys.length; i += 1) {
            itemKey = localKeys[i];

            doc = JSON.parse(localStorage[itemKey]);
            saveToRemote(doc);
        }
    };

    this.updateLocalCount = function () {
        var count = Object.keys(localStorage).length;
        $('#documentsInLocalStorage').html(count);
    };

    this.save = function () {
        var docText = $('#input').val().trim();
        var docFactory = new DocumentFactory();
        var doc = docFactory.create(docText);

        saveToLocal(doc);

        if (navigator.onLine) {
            that.saveAllToRemote();
        }
    };

}

module.exports = HomeSave;
