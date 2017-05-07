const PERSONAL = require('../personal.json');
var test = require('tape');
var S3Factory = require('../../journal/src/factories/s3-factory');
const fs = require('fs');

function GetEntries(s3, bucket, pageSize) {
    'use strict';

    var that = this;
    var allEntries = [];

    this.loadEntries = function (continuationToken, t, callback) {

        var listParams = {};
        listParams.Bucket = bucket;
        listParams.MaxKeys = pageSize;
        listParams.ContinuationToken = continuationToken;

        s3.listObjectsV2(listParams, function (err, data) {
            if (err) {
                callback(err);
                return;
            }

            allEntries = allEntries.concat(data.Contents);

            if (data.NextContinuationToken) {
                that.loadEntries(data.NextContinuationToken, t, callback);
            } else {
                callback(null, allEntries);
            }

        });
    };

}

function getDateText(dt) {
    'use strict';

    var dateText = dt.getUTCFullYear()
            + '-' + (dt.getUTCMonth() + 1)
            + '-' + dt.getUTCDate()
            + '-' + dt.getUTCHours()
            + '-' + dt.getUTCMinutes()
            + '-' + dt.getUTCSeconds()
            + '-' + dt.getUTCMilliseconds()
            + '-' + 'Z';

    return dateText;
}

function getObjectCallback(s3, bucket, document) {
    'use strict';

    return new Promise(function (resolve, reject) {
        var getParams;
        getParams = {};
        getParams.Bucket = bucket;
        getParams.Key = document.Key;

        s3.getObject(getParams, function (err, dataContent) {
            if (err) {
                reject(err);
            } else {
                resolve({header: document, content: dataContent});
            }
        });
    });
}

test('s3 backup', function (t) {
    'use strict';
    t.plan(1);

    var s3 = new S3Factory().create();
    var documentIndex;
    var getEntries = new GetEntries(s3, PERSONAL.bucket, 50);
    var bucket = PERSONAL.bucket;
    var promises = [];
    var document;
    var folder = './backup/backup-date-' + getDateText(new Date());

    fs.mkdirSync(folder);

    getEntries.loadEntries(null, t, function (err, data) {

        if (err) {
            throw err;
        }

        for (documentIndex = 0; documentIndex < data.length; documentIndex += 1) {
            document = data[documentIndex];
            promises.push(getObjectCallback(s3, bucket, document));
        }

        Promise.all(promises).then(function (responses) {
            responses.map(function (compiledDocument) {
                var documentBody = JSON.stringify(compiledDocument.header) + '\r\n\r\n' + compiledDocument.content.Body;
                var documentDate = getDateText(new Date(compiledDocument.header.Key));
                fs.writeFileSync(folder + '/backup-document-' + documentDate, documentBody);
            });
            t.pass(137, responses.length);
        });
    });

});
