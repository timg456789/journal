var DocumentSave = require('./document-save');
var DocumentFactory = require('./document-factory');
var docFactory = new DocumentFactory();
var SaveIndicator = require('./save-indicator');
var Log = require('./log');

function HomeSave(s3, bucket, esOptions) {
    'use strict';

    var that = this;
    var doc = docFactory.create('');
    var saveIndicator = new SaveIndicator();
    var log = new Log();

    function removeFromLocal(itemKey) {
        log.add('removing locally: ' + itemKey);
        localStorage.removeItem(itemKey);

        that.updateLocalCount();
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
            log.add('setting saved to remote');
            saveIndicator.setConnectivitySavedToRemote();
            removeFromLocal(doc.time);
        };
        context.fail = function (failSaveSearch) {
            log.add('failure saving: ' + JSON.stringify(failSaveSearch, 0, 4));
        };

        var documentSave = new DocumentSave(esOptions, s3, bucket, context);
        documentSave.save(doc);
    }

    this.saveInputToLocal = function () {
        var docText = $('#input').val().trim();
        doc.content = docText;
        log.add('saving locally: ' + docText);

        var docJson = JSON.stringify(doc);
        localStorage.setItem(doc.time, docJson);

        that.updateLocalCount();
        saveIndicator.setConnectivitySavedToLocal();
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
                log.add('error listing objects: ' + JSON.stringify(err));
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
        var currentDoc;
        var localKeys = Object.keys(localStorage);

        for (i = 0; i < localKeys.length; i += 1) {
            itemKey = localKeys[i];

            currentDoc = JSON.parse(localStorage[itemKey]);
            saveToRemote(currentDoc);
        }
    };

    this.updateLocalCount = function () {
        var count = Object.keys(localStorage).length;
        $('#documentsInLocalStorage').html(count);
    };

    this.save = function () {
        that.saveInputToLocal();
        if (navigator.onLine) {
            that.saveAllToRemote();
        }
    };

}

module.exports = HomeSave;
