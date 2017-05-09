var Search = require('./search');
var Log = require('./log');
var Md5 = require('./library/md5');

function DocumentSave(esOptions, s3, bucket, context) {
    'use strict';

    this.save = function (doc) {
        var options = {};
        options.Bucket = bucket;
        options.Key = doc.time;
        options.Body = JSON.stringify(doc);
        options.ServerSideEncryption = 'AES256';
        options.ACL = 'bucket-owner-full-control';
        doc.hash = new Md5().create(doc.content + doc.time);
        options.Metadata = {'md5Hash': doc.hash};   // This works, but the callback in the sdk doesn't recognize the header.
                                                    // It's on new documents. Need to use manual requests.
                                                    // Then, I don't need to tamper with the actual message like below.

        esOptions.docTitle = doc.time;

        s3.upload(options, function (err) {
            if (err) {
                var msg = 'failure saving: ' + JSON.stringify(err, 0, 4);
                var log = new Log();
                log.add(msg);
                context.fail(err);
            } else {
                var search = new Search();
                search.upload(esOptions, doc, context);
            }
        });
    };
}

module.exports = DocumentSave;
