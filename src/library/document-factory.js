function DocumentFactory() {
    'use strict';

    this.create = function (content, time) {
        var doc = {};
        doc.content = content;
        doc.time = time || new Date().toISOString();
        return doc;
    };

}

module.exports = DocumentFactory;