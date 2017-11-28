/**
 * Generates an array of dates (with or without day) between two dates.
 * Either like ["2017-01-01", "2017-02-01", "2017-03-01"] or ["2017-01", "2017-02", "2017-03"] (appendDays false)
 * @param startDateString In YYYY-MM-DD. This is not actually used, instead, windowStartString is used
 * @param endDateString In YYYY-MM-DD. Used for the end of the period, if this happens before number of months set in windowsize is reached
 * @param windowStartString In YYYY-MM-DD. Start of the timewindow as a string
 * @param windowSize Integer, maximum number of months to output
 * @param appendDay Bool, should we append the day (first of month)
 * @returns {null, string[]}
 */
export function generateMonthListFromPeriod(startDateString, endDateString, windowStartString, windowSize, appendDay) {
    "use strict";
    if (startDateString === undefined || endDateString === undefined || startDateString === null || endDateString === null || windowStartString === undefined || windowStartString === null) {
        return null;
    }

    let start = startDateString.split("-");
    let end = endDateString.split("-");
    let startWindow = windowStartString.split("-");
    let startYear = parseInt(start[0]);
    let endYear = parseInt(end[0]);
    let startWindowYear = parseInt(startWindow[0]);
    let rawDates = [];

    //check if window starts after end and set equal if so to avoid infinite loop
    if (startWindowYear > endYear || (startWindowYear === endYear && parseInt(startWindow[1]) > parseInt(end[1]))) {
        startWindow = end;
        startWindowYear = endYear;
    }

    //count displayed months, so that we can break after windowSize
    let monthCounter = 0;

    yearLoop:
        for (let i = startWindowYear; i <= endYear; i++) {
            let endMonth = i !== endYear ? 11 : parseInt(end[1]) - 1;
            let startMon = i === startWindowYear ? parseInt(startWindow[1]) - 1 : 0;
            for (let j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
                monthCounter++;
                let month = j + 1;
                let displayMonth = month < 10 ? "0" + month : month;
                rawDates.push(`${i}-${displayMonth}${appendDay === true || appendDay === undefined ? "-01" : ""}`);
                if (monthCounter >= windowSize) {
                    break yearLoop;
                }
            }
        }

    return rawDates;
}

/**
 * Returns an array with months between two dates. Like: ["2017-01", "2017-02", "2017-03"]
 * @param startDateString String, YYYY-MM-DD.
 * @param endDateString String, YYYY-MM-DD.
 * @returns {Array}
 */
export function generateMonthListBetweenTwoDates(startDateString, endDateString){
    "use strict";
    if (startDateString === undefined || endDateString === undefined || startDateString === null || endDateString === null) {
        return [];
    }

    let start = startDateString.split("-");
    let end = endDateString.split("-");
    let startYear = parseInt(start[0]);
    let endYear = parseInt(end[0]);
    let rawDates = [];

    //check if start is before end
    if (startYear > endYear || (startYear === endYear && parseInt(start[1]) > parseInt(end[1]))) {
        start = end;
        startYear = endYear;
    }

    for (let i = startYear; i <= endYear; i++) {
        let endMonth = i !== endYear ? 11 : parseInt(end[1]) - 1;
        let startMon = i === startYear ? parseInt(start[1]) - 1 : 0;
        for (let j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
            let month = j + 1;
            let displayMonth = month < 10 ? "0" + month : month;
            rawDates.push(`${i}-${displayMonth}`);
        }
    }

    return rawDates;
}