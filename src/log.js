function Log() {
    // It doesn't matter what gets logged or how it gets logged,
    // it gets routed through here and is non-blocking.
    this.add = function (msg) {
        console.log(msg);
        //$('#debug-console').append(msg);
    };

}

module.exports = Log;