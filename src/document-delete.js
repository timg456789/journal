function DeletePromise(s3, bucket) {
    'use strict';

    this.deletePromise = function (key) {
        return new Promise(function (resolve, reject) {

            var options = {};
            options.Bucket = bucket;
            options.Key = key;

            // This needs to delete from elastic instead
            // once the save flow is fixed.
            s3.deleteObject(options, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data); // Null in the browser
                }
            });
        });
    };

}

module.exports = DeletePromise;
