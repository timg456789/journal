var Search = require('./search');
var Log = require('./Log');

function DocumentSave(esOptions, s3, bucket, context) {
    'use strict';

    this.save = function (doc) {
        var options = {};
        options.Bucket = bucket;
        options.Key = doc.time;
        options.Body = JSON.stringify(doc);
        options.ServerSideEncryption = 'AES256';

        esOptions.docTitle = doc.time;

        s3.upload(options, function (err, data) {
            if (err) {
                var msg = 'failure saving: ' + JSON.stringify(err, 0, 4);
                var log = new Log();
                log.add(msg);
            } else {
                var search = new Search();
                search.upload(esOptions, doc, context);
            }
        });
    };
}

module.exports = DocumentSave;
