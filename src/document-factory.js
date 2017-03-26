function DocumentFactory() {
    'use strict';

    this.create = function(content) {
        var doc = {};
        doc.content = content;
        doc.time = new Date().toISOString();
        return doc;
    };

}

module.exports = DocumentFactory;