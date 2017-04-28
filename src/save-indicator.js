function SaveIndicator() {
    'use strict';

    var saveButton = $('#save');

    function setConnectivity(connectivityClass) {
        saveButton.removeClass('btn-primary');
        saveButton.removeClass('btn-success');
        saveButton.removeClass('btn-danger');
        saveButton.removeClass('btn-warning');
        saveButton.removeClass('btn-info');
        $('#save').addClass(connectivityClass);
    }

    this.setConnectivityAvailable = function (onLine) {
        setConnectivity(onLine ? 'btn-success' : 'btn-danger');
    };

    this.setConnectivityUnsavedChanges = function () {
        setConnectivity('btn-warning')
    };

    this.setConnectivitySavedToRemote = function () {
        setConnectivity('btn-primary');
    };

    this.setConnectivitySavedToLocal = function () {
        setConnectivity('btn-info');
    };

}

module.exports = SaveIndicator;
