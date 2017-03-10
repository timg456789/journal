
function CalendarCalculator() {

    this.getMonthAdjustedByWeek = function (year, month, doDaily, doWeekStart, doWeekEnd) {
        var result = {};

        result.startOfMonth = this.createByMonth(year, month);
        result.adjustedStart = this.getFirstDayInWeek(result.startOfMonth);
        result.currentDate =  new Date(result.adjustedStart);
        result.end = this.getNextMonth(result.startOfMonth);

        var dayInWeek;
        while (result.currentDate.getUTCMonth() !== result.end.getUTCMonth()) {
            if (doWeekStart) {
                doWeekStart(result.currentDate, result);
            }

            for (dayInWeek = result.currentDate.getUTCDay(); dayInWeek < 7; dayInWeek += 1) {
                if (doDaily) {
                    doDaily(result.currentDate);
                }

                result.currentDate.setDate(result.currentDate.getDate() + 1);
            }

            if (doWeekEnd) {
                doWeekEnd(result.currentDate);
            }
        }

        return result;
    };

    this.createByMonth = function (year, month) {
        var startUtcMs = Date.UTC(year, month);
        var dt = new Date(startUtcMs);
        return dt;
    };

    this.getFirstDayInWeek = function (date) {
        var dt = new Date(date);
        dt.setUTCDate(dt.getUTCDate() - dt.getUTCDay());
        return dt;
    };

    this.getNextMonth = function (date) {

        var dt = new Date(date);
        dt.setUTCMonth(dt.getUTCMonth() + 1);
        return dt;

    };

}

module.exports = CalendarCalculator;