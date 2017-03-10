const cal = require('income-calculator/src/calendar');
const CalendarCalculator = require('../src/calendar-calculator');
const calCalc = new CalendarCalculator();
const BalanceViewModel = require('./balance-view-model');

function getTxInputHtmlMonthly(date) {
    var txHtmlInput = '<select class="date form-control inline-group">';
    var txHtmlDayInput;
    var currentDayOfWeek;
    var isDaySelected = '';

    if (date) {
        date = new Date(date);
    } else {
        date = calCalc.createByMonth(new Date().getUTCFullYear(), new Date().getUTCMonth());
    }

    currentDayOfWeek = new Date(date.getTime());
    currentDayOfWeek.setUTCDate(1);

    for (var day = 1; day <= 28; day++) {
        txHtmlDayInput = ' value="' + currentDayOfWeek + '" ';

        if (currentDayOfWeek.getUTCDate() === date.getUTCDate()) {
            isDaySelected = 'selected="selected"';
        } else {
            isDaySelected = '';
        }

        txHtmlInput += '<option' + txHtmlDayInput + isDaySelected + '>' +
            day +
            '</option>';
        currentDayOfWeek.setUTCDate(currentDayOfWeek.getUTCDate() + 1);
    }

    txHtmlInput += '</select>';
    return txHtmlInput;
}

function getTxInputHtmlWeekly(date) {
    var txHtmlInput = '<select class="date form-control inline-group">';
    var txHtmlDayInput;
    var currentDayOfWeek;
    var isDaySelected = '';

    if (date) {
        date = new Date(date);
    } else {
        date = new Date();
        date = calCalc.getFirstDayInWeek(date);
    }

    currentDayOfWeek = calCalc.getFirstDayInWeek(date);

    for (var day = 0; day < 7; day++) {
        txHtmlDayInput = ' value="' + currentDayOfWeek + '" ';

        if (currentDayOfWeek.getUTCDay() === date.getUTCDay()) {
            isDaySelected = 'selected="selected"';
        } else {
            isDaySelected = '';
        }

        txHtmlInput += '<option' + txHtmlDayInput + isDaySelected + '>' +
            cal.DAY_NAMES[day] +
            '</option>';
        currentDayOfWeek.setUTCDate(currentDayOfWeek.getUTCDate() + 1);
    }

    txHtmlInput += '</select>';
    return txHtmlInput;
}

exports.getTransactionView = function (transaction, iteration, type) {
    'use strict';

    var amount = '';
    if (transaction.amount) {
        amount = transaction.amount / 100;
    }

    var date = '';
    if (transaction.date) {
        date = transaction.date;
    }

    var name = '';
    if (transaction.name) {
        name = transaction.name;
    }

    var txHtmlInput;

    if (iteration === 'weekly') {
        txHtmlInput = getTxInputHtmlWeekly(date);
    } else if (iteration === 'monthly') {
        txHtmlInput = getTxInputHtmlMonthly(date);
    } else {
        txHtmlInput = '<input class="date form-control inline-group" type="text" value="' + date + '" />';
    }

    var html = '<div class="' + iteration + '-' + type + '-item input-group transaction-input-view">' +
            '<div class="input-group-addon">$</div>' +
            '<input class="amount form-control inline-group" type="text" value="' + amount + '" /> ' +
            '<div class="input-group-addon">on</div>' +
            txHtmlInput;
    html += '<div class="input-group-addon">name</div>';
    html += '<input class="name form-control inline-group" type="text" value="' + name + '" />';
    html += '</div>';

    var view = $(html);

    if (transaction.budget !== undefined) {
        var budgetInput = '<input class="budget form-control inline-group" ' +
                'type="text" value="' + transaction.budget + '" /> ';
        view.append(budgetInput);
    }

    var removeButtonHtml = '<div class="input-group-addon remove">' +
            '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>' +
            '</div>';

    var removeButton = $(removeButtonHtml);

    removeButton.click(function () {
        view.remove();
    });

    view.append(removeButton);

    return view;
};

function getTransactionModel(target) {
    'use strict';

    var transaction = {};

    var amountInput = $(target).children('input.amount');
    var dateInput = $(target).children('.date.form-control');
    var nameInput = $(target).children('input.name');

    transaction.amount = parseFloat(amountInput.val().trim()) * 100;

    var rawDate = dateInput.val();
    var rawTrimmedDate = rawDate.trim();

    transaction.date = new Date(rawTrimmedDate);
    transaction.name = nameInput.val().trim();
    transaction.type = 'expense';

    var budgetInput = $(target).children('input.budget');
    if (budgetInput && budgetInput.length > 0) {
        transaction.budget = budgetInput.val().trim();
    }

    return transaction;
}

function insertTransactionView(transaction, target, iteration, type) {
    'use strict';
    $(target).append(exports.getTransactionView(transaction, iteration, type));
}

function insertTransactionViews(transactions, target, iteration, type) {
    'use strict';
    $(target).empty();
    var i;
    for (i = 0; i < transactions.length; i += 1) {
        insertTransactionView(transactions[i], target, iteration, type);
    }
}

function getTransactionByName (txns, name) {
    for (var i = 0; i < txns.length; i++) {
        if (txns[i].name === name) {
            return txns[i];
        }
    }

    return null;
}

function setBalances(budget) {
    var balanceTarget = '#balance-input-group';
    $(balanceTarget).empty();
    var i;
    var balanceView;

    for (i = 0; i < budget.balances.length; i += 1) {

        var weeklyAmount;
        var monthlyTxn = getTransactionByName(budget.monthlyRecurringExpenses, budget.balances[i].name);
        if (monthlyTxn) {
            weeklyAmount = (monthlyTxn.amount/100) / cal.WEEKS_IN_MONTH;
        } else {
            var weeklyTxn = getTransactionByName(budget.weeklyRecurringExpenses, budget.balances[i].name);
            if (weeklyTxn) {
                weeklyAmount = weeklyTxn.amount/100;
            } else {
                weeklyAmount = 0;
            }
        }

        balanceView = BalanceViewModel.getBalanceView(
            budget.balances[i].amount,
            budget.balances[i].name,
            budget.balances[i].rate,
            weeklyAmount
        );
        $(balanceTarget).append(balanceView);
    }
}

exports.setView = function (budget) {
    'use strict';

    if (budget.balances) {
        setBalances(budget);
    }
    $('#biweekly-input').val(budget.biWeeklyIncome.amount / 100);
    insertTransactionViews(budget.oneTime, '#one-time-input-group', 'one-time', 'expense');
    insertTransactionViews(budget.weeklyRecurringExpenses, '#weekly-input-group', 'weekly', 'expense');
    insertTransactionViews(budget.monthlyRecurringExpenses, '#monthly-input-group', 'monthly', 'expense');
    insertTransactionViews(budget.actual, '#actuals-input-group', 'actual', 'expense');
};

exports.getModel = function () {
    'use strict';

    var budgetSettings = {};

    budgetSettings.biWeeklyIncome = {};
    budgetSettings.biWeeklyIncome.amount = parseInt($('#biweekly-input').val().trim()) * 100;
    budgetSettings.biWeeklyIncome.date = new Date(Date.UTC(2015, 11, 25));

    budgetSettings.monthlyRecurringExpenses = [];
    $('.monthly-expense-item').each(function () {
        budgetSettings.monthlyRecurringExpenses.push(getTransactionModel(this));
    });

    budgetSettings.weeklyRecurringExpenses = [];
    $('.weekly-expense-item').each(function () {
        budgetSettings.weeklyRecurringExpenses.push(getTransactionModel(this));
    });

    budgetSettings.oneTime = [];
    $('.one-time-expense-item').each(function () {
        var ote = getTransactionModel(this);
        if (ote.amount > 0) {
            ote.type = 'income';
        } else {
            ote.amount = ote.amount * -1;
        }
        budgetSettings.oneTime.push(ote);
    });

    budgetSettings.actual = [];
    $('.actual-expense-item').each(function () {
        budgetSettings.actual.push(getTransactionModel(this));
    });

    budgetSettings.balances = BalanceViewModel.getModels();

    return budgetSettings;
};
