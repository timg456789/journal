const cal = require('income-calculator/src/calendar');
const PayoffDateCalculator = require('income-calculator/src/payoff-date-calculator');
const payoffDateCalculator = new PayoffDateCalculator();

exports.getModels = function() {
    var balances = [];

    $('.balance-item').each(function () {
        balances.push(exports.getModel(this));
    });

    return balances;
};

exports.getModel = function (target) {
    'use strict';

    var balance = {};

    var amountInput = $(target).children('input.amount');
    var nameInput = $(target).children('input.name');
    var rateInput = $(target).children('input.rate');

    balance.amount = amountInput.val().trim();
    balance.name = nameInput.val().trim();
    balance.rate = rateInput.val().trim();

    return balance;
};

exports.getBalanceView = function (amount, name, rate, weeklyAmount) {
    'use strict';

    var html = '<div class="balance-item input-group transaction-input-view">' +
        '<div class="input-group-addon">$</div>' +
        '<input class="amount form-control inline-group" type="text" value="' + amount + '" />';
    html += '<div class="input-group-addon">name</div>';
    html += '<input class="name form-control inline-group" type="text" value="' + name + '" />';
    html += '<div class="input-group-addon">rate</div>';
    html += '<input class="rate form-control inline-group" type="text" value="' + rate + '" />';

    if (weeklyAmount) {
        var payoffDate;
        var totalInterest;

        try {
            var balanceStatement = payoffDateCalculator.getPayoffDate({
                startTime: Date.UTC(
                    new Date().getUTCFullYear(),
                    new Date().getUTCMonth(),
                    new Date().getUTCDate()
                ),
                totalAmount: amount,
                payment: weeklyAmount,
                DayOfTheWeek: cal.FRIDAY,
                rate: rate
            });

            payoffDate = balanceStatement.date.getUTCFullYear() + '-' +
                balanceStatement.date.getUTCMonth() + '-' +
                balanceStatement.date.getUTCDate();
            totalInterest = Math.ceil(balanceStatement.totalInterest);
        } catch (err) {
            payoffDate = err;
            totalInterest = err;
        }

        html += '<div class="input-group-addon">payment: ' + Math.ceil(weeklyAmount) +
            ' payoff:' + payoffDate +
            ' interest: ' + totalInterest;

        html += '</div>';
    }



    html += '</div>';

    var view = $(html);

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
