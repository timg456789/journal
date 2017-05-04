var Search = require('./search');

function DocumentSave(esOptions, s3, bucket, context) {
    'use strict';

    this.save = function (doc) {
        var options = {};
        options.Bucket = bucket;
        options.Key = doc.time;
        options.Body = JSON.stringify(doc);

        esOptions.docTitle = doc.time;

        s3.upload(options, function (err) {
            if (err) {
                console.log('failure saving: ' + JSON.stringify(err, 0, 4));
            } else {
                var search = new Search();
                search.upload(esOptions, doc, context);
            }
        });
    };
}

module.exports = DocumentSave;
