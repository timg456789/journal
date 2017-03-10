const cal = require('income-calculator/src/calendar');
const CalendarCalculator = require('../src/calendar-calculator');
const calCalc = new CalendarCalculator();
const NetIncomeCalculator = require('income-calculator/src/net-income-calculator');
const netIncomeCalculator = new NetIncomeCalculator();

const CalendarAggregator = require('income-calculator/src/calendar-aggregator');
const calendarAggregator = new CalendarAggregator();

function getTransactionView(name, amount, type, budget, isActual) {
    'use strict';

    var budgetedCss = '';

    if (budget && budget.length > 0) {
        budgetedCss = 'budgeted';
    } else if (isActual) {
        budgetedCss = 'unbudgeted';
    }

    return '<div class="transaction-view ' +
            type + ' ' +
            budgetedCss + '">' +
            '<div class="name">' + name + '</div>' +
            '<div class="amount">$' + amount / 100 + '</div>' +
            '</div>';
}

function getMonthContainerId(date) {
    'use strict';
    return 'items-container-for-month-' +
            date.getFullYear() + '-' +
            date.getMonth();
}

function getMonthHeading(date) {
    'use strict';
    return cal.MONTH_NAMES[date.getMonth()] +
            ' ' +
            date.getFullYear() +
            ': ' + '<span id="month-net-header-value"></span>';
}

function getDateTarget(date) {
    'use strict';
    return date.getUTCFullYear() + '-' +
            date.getUTCMonth() + '-' +
            date.getUTCDate();
}

function getDayTarget(date) {
    'use strict';
    return 'day-of-' + getDateTarget(date);
}

function getDayView(date, inMonth) {
    'use strict';
    var css = !inMonth
        ? 'out-of-month'
        : '';
    css += ' day-view'
    css = css.trim()
    var dayViewHtml = '<div class="' + css + ' day-col col-xs-1 ' +
            getDayTarget(date) + '">' +
            '<span class="calendar-day-number">' +
            date.getUTCDate() + '</div>';
    return dayViewHtml;
}

function getWeekTarget(date) {
    'use strict';
    return 'week-of-' + getDateTarget(date);
}

function addMonthContainer(monthContainerId, date) {
    $('#months-container').append(
        '<div class="month-heading">' + getMonthHeading(date) + '</div>' +
        '<div class="items-container-for-month" id="' +
        monthContainerId +
        '"></div>'
    );
}

function addWeekAbbreviationHeaders(monthTarget) {
    var d;
    for (d = 0; d < 7; d += 1) {
        $(monthTarget + '>' + '.weeks').append(
            '<div class="day-col col-xs-1 week-name">' + cal.DAY_NAME_ABBRS[d] + '</div>');
    }
}

function addMonth(year, month) {
    var date = calCalc.createByMonth(year, month);
    $('#months-container').empty();
    var monthContainerId = getMonthContainerId(date);
    addMonthContainer(monthContainerId, date);

    var monthTarget = '#' + monthContainerId;
    $(monthTarget).append('<div class="weeks row"></div>');
    addWeekAbbreviationHeaders(monthTarget);
    $(monthTarget + '>' + '.weeks').append('<div class="day-col col-xs-1 week-name">Totals</div>');

    return monthContainerId;
}

exports.build = function (year, month) {
    'use strict';

    var monthContainerId = addMonth(year, month);
    var dayViewContainer;
    var transactionsForWeekTarget;
    calCalc.getMonthAdjustedByWeek(
        year,
        month,
        function (currentDate) {
            var dayView = getDayView(currentDate, new Date().getUTCMonth() === currentDate.getUTCMonth());
            $('.' + transactionsForWeekTarget).append(dayView);
        },
        function (currentDate) {
            transactionsForWeekTarget = getWeekTarget(currentDate);
            dayViewContainer = ('<div class="transactions-for-week row ' + transactionsForWeekTarget + ' "></div>');
            var monthTarget = '#' + monthContainerId;
            $(monthTarget).append(dayViewContainer);
        },
        function (currentDate) {
            $('.' + transactionsForWeekTarget).append(
                '<div class="day-view totals-view day-col col-xs-1">' +
                '</div>'
            );
        });
};

function loadTransactions(items, areActuals) {
    'use strict';
    var bi;
    var budgetItem;
    for (bi = 0; bi < items.length; bi += 1) {
        budgetItem = items[bi];
        $('.' + getDayTarget(budgetItem.date)).append(
            getTransactionView(
                budgetItem.name,
                budgetItem.amount,
                budgetItem.type,
                budgetItem.budget,
                areActuals
            )
        );
    }
}

function getSummary(budgetSettings, actual, startTime, endTime) {
    'use strict';
    var budget = netIncomeCalculator.getBudget(
        budgetSettings,
        startTime,
        endTime
    );

    var summary = calendarAggregator.getSummary(
        startTime,
        endTime,
        budget,
        actual
    );

    return summary;
}

function loadWeeklyTotals(budgetSettings, actual, start) {
    'use strict';

    var weekEnd;
    var summary;
    var type;
    var dt = new Date(start);
    var net = 0;

    var doOnWeekStart = function (currentDate, result) {

        weekEnd = new Date(currentDate.getTime());
        weekEnd.setUTCDate(weekEnd.getUTCDate() + cal.DAYS_IN_WEEK);

        if (weekEnd.getUTCMonth() > currentDate.getUTCMonth()) {
            weekEnd.setUTCDate(1);
        }

        var summaryStart = currentDate.getTime();

        if (summaryStart === result.adjustedStart.getTime()) {
            summaryStart = result.startOfMonth.getTime();
        }

        summary = getSummary(
            budgetSettings,
            actual,
            summaryStart,
            weekEnd.getTime()
        );

        type = summary.net > 0 ? 'income' : 'expense';

        $('.' + getWeekTarget(currentDate) + ' .totals-view').append(
            getTransactionView('', summary.net, type)
        );

        net += summary.net;
    };

    calCalc.getMonthAdjustedByWeek(
        dt.getUTCFullYear(),
        dt.getUTCMonth(),
        null,
        doOnWeekStart,
        null);

    return net;
}

exports.load = function (budgetSettings, actual, start, end) {
    'use strict';
    $('#debug-console').append('<div>Showing from: ' + start.toISOString() + ' UTC</div>');
    $('#debug-console').append('<div>Until: ' + end.toISOString() + ' UTC</div>');

    var summary = getSummary(budgetSettings, actual, start.getTime(), end.getTime());

    loadTransactions(summary.budgetItems);
    loadTransactions(summary.actualsForWeek, true);

    $('#month-net-header-value').append(summary.net / 100);

    var netByWeeklyTotals = loadWeeklyTotals(budgetSettings, actual, start);

    $('#month-net-header-value').attr('data-net-by-weekly-totals', netByWeeklyTotals);
};
