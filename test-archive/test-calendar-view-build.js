const Cal = require('income-calculator/src/calendar');
const CalendarCalculator = require('../src/calendar-calculator');
const calCalc = new CalendarCalculator();
const test = require('tape');

test('describe november in weeks ', function(t) {
    t.plan(4);

    var result = calCalc.getMonthAdjustedByWeek(2016, Cal.NOVEMBER);

    t.equal(JSON.stringify(result.startOfMonth), '"2016-11-01T00:00:00.000Z"', 'month start november');
    t.equal(JSON.stringify(result.adjustedStart), '"2016-10-30T00:00:00.000Z"', 'adjusted month start november');
    t.equal(JSON.stringify(result.end), '"2016-12-01T00:00:00.000Z"', 'month end');
    t.equal(JSON.stringify(result.currentDate), '"2016-12-04T01:00:00.000Z"', 'adjusted month end november');

});

test('describe december in weeks ', function(t) {
    t.plan(4);

    var result = calCalc.getMonthAdjustedByWeek(2016, Cal.DECEMBER);

    t.equal(JSON.stringify(result.startOfMonth), '"2016-12-01T00:00:00.000Z"', 'month start');
    t.equal(JSON.stringify(result.adjustedStart), '"2016-11-27T00:00:00.000Z"', 'adjusted month start december');
    t.equal(JSON.stringify(result.end), '"2017-01-01T00:00:00.000Z"', 'month end');
    t.equal(JSON.stringify(result.currentDate), '"2017-01-01T00:00:00.000Z"', 'adjusted month end december');

});
