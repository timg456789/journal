
function HomeController() {
    'use strict';

    const calendarView = require('./calendar-view');
    const homeView = require('./home-view');
    const BalanceViewModel = require('./balance-view-model');
    var bucket;
    var s3ObjKey;
    var accessKeyId;
    var secretAccessKey;

    function log(error) {
        console.log(error);
        $('#debug-console').append('<div>' + error + '</div>');
    }

    function checkNet() {
        const EXPECTED_MONTHLY_NET = 172000;

        var displayedNet = parseInt($('#month-net-header-value').html());
        if (displayedNet !== EXPECTED_MONTHLY_NET / 100) {
            log('expected net of ' +
                    (EXPECTED_MONTHLY_NET / 100) +
                    ' for October 2016, but was: ' + displayedNet);
        }

        var displayedNetByWeek = $('#month-net-header-value')
            .attr('data-net-by-weekly-totals');
        displayedNetByWeek = parseInt(displayedNetByWeek);
        if (displayedNetByWeek !== EXPECTED_MONTHLY_NET) {
            log('expected net of ' +
                    EXPECTED_MONTHLY_NET +
                    ' for October 2016, but was: ' + displayedNetByWeek);
        }

    }

    function getS3Params() {
        return {
            Bucket: bucket,
            Key: s3ObjKey
        };
    }

    function dataFactory() {
        var AWS = require('aws-sdk');
        AWS.config.update(
            {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey,
                region: 'us-east-1'
            }
        );
        return new AWS.S3();
    }

    function hasCredentials() {
        return accessKeyId && secretAccessKey;
    }

    function updateQueryStringParameter(uri, key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1
            ? "&"
            : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        } else {
            return uri + separator + key + "=" + value;
        }
    }

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    function save() {
        var budgetDisplayName;
        if (s3ObjKey) {
            budgetDisplayName = getParameterByName('data');
        } else {
            budgetDisplayName = guid();
        }

        var s3 = dataFactory();
        var options = {};
        options.Bucket = bucket;
        options.Key = s3ObjKey;
        options.Body = JSON.stringify(homeView.getModel(), 0, 4);
        s3.upload(options, function (err) {
            if (err) {
                log('failure saving settings: ' + JSON.stringify(err, 0, 4));
            }

            var url = updateQueryStringParameter(location.href, 'data', budgetDisplayName);
            $('#output').append('<p>You can view this budget at anytime by viewing this ' +
                    '<a href="' + url + '">' + url + '</a>.' +
                    '</p>');

            $('#months-container').prepend(
                '<div id="calendar-legend">' +
                'Legend&nbsp;' +
                '<span class="transaction-view expense budgeted" title="expenditure that occurred within budget">' +
                'Budgeted Spending</span>' +
                '</span>' +
                '<span class="transaction-view expense" title="budgeted expense">' +
                'Budgeted Expense</span>' +
                '</div>'
            );

        });
    }

    function project() {
        var budgetSettings = homeView.getModel();
        var year = new Date().getUTCFullYear();
        var month = new Date().getUTCMonth();
        var start = new Date(Date.UTC(year, month, 1));
        var end = new Date(start.getTime());
        end.setUTCMonth(end.getUTCMonth() + 1);
        calendarView.build(year, month);
        calendarView.load(budgetSettings, budgetSettings.actual, start, end);
        checkNet();
        $('#input-form').hide();
        $('#output').empty();

        if (hasCredentials()) {
            save();
        }
    }

    function refresh() {
        dataFactory().getObject(getS3Params(), function (err, data) {
            if (err) {
                log(JSON.stringify(err, 0, 4));
            }
            homeView.setView(JSON.parse(data.Body.toString('utf-8')));
        });
    }
    
    function initGroup(name) {
        $('#add-new-' + name).click(function () {
            $('#' + name + '-input-group').append(homeView.getTransactionView({}, name, 'expense'));
        });
    }

    this.init = function (settings) {

        var budgetName = settings.s3ObjectKey;
        bucket = settings.s3Bucket;
        s3ObjKey = budgetName + '.json';
        accessKeyId = settings.pub;
        secretAccessKey = settings.priv;

        $('#account-settings-button').click(function () {
            $('#account-settings-view').modal({
                backdrop: 'static'
            });
        });

        $('#account-settings-save-close-button').click(function () {
            saveAndClose();
        });

        $('#awsBucket').val(bucket);
        $('#budgetName').val(budgetName);
        $('#awsAccessKeyId').val(settings.pub);
        $('#awsSecretAccessKey').val(settings.priv);

        $('#load-budget').click(function () {
            refresh();
        });

        $('#project').click(function () {
            var year = $('#calendar-year');
            var month = $('#calendar-month');
            project(year, month);
        });

        initGroup('monthly');
        initGroup('weekly');

        $('#add-new-one-time-expense').click(function () {
            $('#one-time-input-group').append(homeView.getTransactionView({}, 'one-time', 'expense'));
        });

        $('#add-new-actual-expense').click(function () {
            $('#actuals-input-group').append(homeView.getTransactionView({budget: ''}, 'actual', 'expense'));
        });

        $('#add-new-balance').click(function () {
            $('#balance-input-group').append(BalanceViewModel.getBalanceView(100, 'new balance', '.035'));
        });

        if (s3ObjKey) {
            refresh();
        }
    };

    function saveAndClose() {
        var url = window.location.hash.split('?')[0];
        url += 'index.html?';

        url += 'pub=' + $('#awsAccessKeyId').val();
        url += '&priv=' + $('#awsSecretAccessKey').val();
        url += '&data=' + $('#budgetName').val();
        url += '&s3Bucket=' + $('#awsBucket').val();

        window.location.href = url;
    }

    function getParameterByName(name) {
        'use strict';

        var url = location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
        var results = regex.exec(url);
        if (!results) {
            return null;
        }
        if (!results[2]) {
            return '';
        }
        return results[2];
    }

}

module.exports = HomeController;