const DocumentSave = require('./document-save');
const DocumentDelete = require('./document-delete');
const SaveIndicator = require('./save-indicator');
const Log = require('./log');
const DocumentFactory = require('./library/document-factory');
const UUID = require('./library/UUID');

var docFactory = new DocumentFactory();
var uuid = new UUID();

function HomeSave(s3, bucket, esOptions) {
    'use strict';

    var that = this;
    var doc = docFactory.create('');
    var saveIndicator = new SaveIndicator();
    var log = new Log();

    function removeFromLocal(itemKey) {
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
            saveIndicator.setConnectivitySavedToRemote();
            removeFromLocal(doc.time);
        };
        context.fail = function (failSaveSearch) {
            log.add('failure saving: ' + JSON.stringify(failSaveSearch, 0, 4));
        };

        var documentSave = new DocumentSave(esOptions, s3, bucket, context);
        documentSave.save(doc);
    }

    function deleteClick(key, continuationToken) {
        return function () {

            var menuId = uuid.create();
            var menuHtml = `<div class="modal fade" id="` + menuId + `" role="dialog">
      <div class="modal-dialog">
          <div class="modal-content">
              <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal">&times;</button>
                  <h2 class="modal-title">Delete Journal Entry</h2>
              </div>
              <div class="modal-body">
                  <form>
                      <div>
                          This will permanently delete the record from all remote storage. Enter the entry\'s date to confirm you have made a local backup and wish to permanently delete the journal entry.
                      </div>
                      <div class="form-group">
                          <label>Date: ` +  key + `</label>
                          <input type="text" class="form-control confirmationInput">
                      </div>
                      <div class="feedback"></div>
                  </form>
              </div>
              <div class="modal-footer">
                  <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                  <button type="button" class="btn btn-danger journalDelete" disabled="disabled">Delete</button>
              </div>
          </div>
      </div>
  </div>`;

            $('body').append(menuHtml);
            var confirmationInput = $('#' + menuId + ' .confirmationInput');
            var journalDelete = $('#' + menuId + ' .journalDelete');
            confirmationInput.keypress(function (event) {
                var checkingDate = confirmationInput.val() + event.key;
                if (checkingDate === key) {
                    journalDelete.removeAttr('disabled');
                }
            });

            confirmationInput.on('input', function (event) {
                var checkingDate = confirmationInput.val();
                if (checkingDate === key) {
                    journalDelete.removeAttr('disabled');
                }
            });
            journalDelete.click(function () {
                if (confirmationInput.val() === key) {
                    var documentDelete = new DocumentDelete(s3, bucket);
                    var deletePromise = documentDelete.deletePromise(key);
                    deletePromise.then(function (deleteResponse) {
                        // Null here, switch back to callbacks.
                        // However the file deletes deleteResponse.VersionId
                        $('#' + menuId + ' .feedback')
                            .html('Deleted: ' + key)
                            .addClass('bg-success');
                        that.loadEntries(continuationToken); // this should actually be the page before.

                    }).catch(function (err) {
                        $('#' + menuId + ' .feedback').html('Failed to delete: ' + JSON.stringify(err, 0, 4));
                        log.add('error deleting: ' + JSON.stringify(err));
                    });
                }
            });
            $('#' + menuId).modal({
                backdrop: 'static'
            });
        };
    }

    this.saveInputToLocal = function () {
        var docText = $('#input').val().trim();
        doc.content = docText;

        var docJson = JSON.stringify(doc);
        localStorage.setItem(doc.time, docJson);

        that.updateLocalCount();
        saveIndicator.setConnectivitySavedToLocal();
    };

    this.loadEntries = function (continuationToken) {
        $('#journal-entries').empty();
        var listParams = {};
        listParams.Bucket = bucket;
        listParams.MaxKeys = 18;
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
            var entryDelete;

            for(objectIndex = 0; objectIndex < data.Contents.length; objectIndex +=1) {
                entryId = 'entry-key-' + data.Contents[objectIndex].Key;
                entryDelete = $('<button class="btn btn-danger">Delete</button>');
                entry = $('<div id="' + entryId + '" ' +
                    'class="btn btn-default journal-entry-listing">' +
                    data.Contents[objectIndex].Key +
                    '</div>');
                entry.append(entryDelete);
                $('#journal-entries').append(entry);

                getParams = {};
                getParams.Bucket = bucket;
                getParams.Key = data.Contents[objectIndex].Key;
                entry.click(showEntryInInput(s3, getParams));
                entryDelete.click(deleteClick(getParams.Key, continuationToken));
            }

            var viewMoreEntries = $('.view-more-journal-entries');
            viewMoreEntries.unbind('click');
            viewMoreEntries.click(function () {
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
