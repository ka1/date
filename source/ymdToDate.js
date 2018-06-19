/**
 * Convert a string to a date object. Expecting 2017-07-11.
 * @param dateStr
 * @returns {Date}
 */
function ymdToDate(dateStr) {
    "use strict";
    if (dateStr === undefined || dateStr === null) { return null; }
    const [year, month, day] = dateStr.split("-");
    return new Date(year, month - 1, day);
}

function dmyToDate(dateStr) {
    "use strict";
    if (dateStr === undefined || dateStr === null) { return null; }
    const [day, month, year] = dateStr.split(".");
    return new Date(year, month - 1, day);
}

function dmyToYmd(dateStr) {
    "use strict";
    if (dateStr === undefined || dateStr === null) { return null; }
    let [day, month, year] = dateStr.split(".");
    day = parseInt(day);
    month = parseInt(month);
    year = parseInt(year);
    return [year,
        (month>9 ? "" : "0") + month,
        (day>9 ? "" : "0") + day
    ].join("-");
}

function ymToDate(dateStr, getLastDay){
    "use strict";
    if (dateStr === undefined || dateStr === null) { return null; }
    //by default, return the last day
    if (getLastDay === undefined || getLastDay !== false){
        getLastDay = true;
    }
    const [year, month] = dateStr.split("-");
    if (getLastDay === true){
        //use one month ahead, day 0 to get last day of previous month
        return new Date(year, month, 0);
    } else {
        //use first day of month
        return new Date(year, month - 1, 1);
    }
}

function dateToYmd(dateObj) {
    "use strict";
    if (!(dateObj instanceof Date)) { return null; }

    const mm = dateObj.getMonth() + 1; // getMonth() is zero-based
    const dd = dateObj.getDate();

    return [dateObj.getFullYear(),
        (mm>9 ? "" : "0") + mm,
        (dd>9 ? "" : "0") + dd
    ].join("-");
}

function dateToYm(dateObj) {
    "use strict";
    if (!(dateObj instanceof Date)) { return null; }

    const mm = dateObj.getMonth() + 1; // getMonth() is zero-based

    return [dateObj.getFullYear(),
        (mm>9 ? "" : "0") + mm
    ].join("-");
}

function dateToDmy(dateObj) {
    "use strict";
    if (!(dateObj instanceof Date)) { return null; }

    const mm = dateObj.getMonth() + 1; // getMonth() is zero-based
    const dd = dateObj.getDate();

    return [(dd>9 ? "" : "0") + dd,
        (mm>9 ? "" : "0") + mm,
        dateObj.getFullYear()
    ].join(".");
}

/**
 * Offsets a given YYYY-MM date string by a given integer of months
 * @param {string} dateStr
 * @param {string | int} monthOffset
 * @returns {string}
 */
function ymOffset(dateStr, monthOffset) {
    "use strict";

    let theDate = ymToDate(dateStr);
    //make sure we do not run into time zone problems by using around the mid of month
    theDate.setDate(15);
    theDate.setMonth(theDate.getMonth() + parseInt(monthOffset));

    return dateToYm(theDate);
}

/**
 * Offsets a given YYYY-MM-DD date string by a given integer of months,
 * settings the day to 1 to correctly being able to shift end of month dates.
 * @param {string} dateStr
 * @param {string | int} monthOffset
 * @returns {string}
 */
function ymdOffsetIgnoreDay(dateStr, monthOffset){
    "use strict";

    let theDate = ymdToDate(dateStr);
    theDate.setDate(1);
    theDate.setMonth(theDate.getMonth() + parseInt(monthOffset));

    return dateToYmd(theDate);
}

/**
 * Receive the english name of the weekday
 * @param dateObj Date
 * @returns {*}
 */
function getEnglishWeekday(dateObj) {
    "use strict";
    if (!(dateObj instanceof Date)) { return null; }

    const weekday = new Array(7);
    weekday[0] =  "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    return weekday[dateObj.getDay()];
}

/**
 * Receive the german name of the weekday
 * @param dateObj Date
 * @returns {*}
 */
function getGermanWeekday(dateObj) {
    "use strict";
    if (!(dateObj instanceof Date)) { return null; }

    const weekday = new Array(7);
    weekday[0] =  "Sonntag";
    weekday[1] = "Montag";
    weekday[2] = "Dienstag";
    weekday[3] = "Mittwoch";
    weekday[4] = "Donnerstag";
    weekday[5] = "Freitag";
    weekday[6] = "Samstag";

    return weekday[dateObj.getDay()];
}


/**
 * Count the number of months in a period and returns the integer.
 * Floors the first date and ceils the second, ie. JAN-31 to FEB-01 is two months
 * @param startDateString YYYY-MM-DD
 * @param endDateString YYYY-MM-DD
 * @returns {null, int}
 */
function countMonthsInPeriod(startDateString, endDateString){
    "use strict";
    if (startDateString === undefined || endDateString === undefined){
        return null;
    }

    let start      = ymdToDate(startDateString);
    let end        = ymdToDate(endDateString);
    return monthDiff(start, end, "GREEDY");
}

function monthDiff(d1, d2, mode="GREEDY") {
    let modificator;
    switch (mode) {
        //count first month as full and last month as full. same month to same month is one month
        case "GREEDY":
            modificator = 2;
            break;
        //same month to same month should be zero.
        case "FULL":
            modificator = 1;
            break;
        //this is the behaviour described in https://stackoverflow.com/questions/2536379/difference-in-months-between-two-dates-in-javascript
        //will only count to full months between to dates, ie 2010-01-01 to 2010-02-12 is 0 because there are no full months between
        case "STRICT":
        default:
            modificator = 0;
            break;
    }

    let months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth() + modificator;
    return months <= 0 ? 0 : months;
}

class TimeWindow {
    dateStart;
    dateEnd;
    pointer;
    startToEndMonthCount;
    displayStart;
    displayEnd;
    touchLeft;
    touchRight;
    windowSize;
    calculated;

    /**
     * @param projectStart Date string in the format YYYY-MM-DD
     * @param projectEnd Date string in the format YYYY-MM-DD
     * @param windowSize Integer
     * @param currentPointer Date string in the format YYYY-MM-DD
     */
    constructor (projectStart, projectEnd, windowSize, currentPointer = null) {
        this.dateStart = ymdToDate(projectStart);
        this.dateEnd = ymdToDate(projectEnd);
        this.startToEndMonthCount = monthDiff(this.dateStart, this.dateEnd);
        this.touchLeft = false;
        this.touchRight = false;
        this.windowSize = windowSize;
        this.calculated = false;

        //default the pointer to current time
        this.pointer = ymdToDate(currentPointer);
        if (this.pointer === null){
            this.pointer = new Date();
            this.pointer.setHours(0,0,0,0);
        }

        //use first of month. we do not care about days, as this would make the function much more complex (think of february...)
        this.pointer.setDate(1);
        this.dateStart.setDate(1);
        this.dateEnd.setDate(1);
    }

    shiftPointer(offset){
        this.pointer = new Date(this.pointer.getFullYear(), this.pointer.getMonth() + offset, this.pointer.getDate());
    }

    calculateWindow() {
        //move pointer to start if the project is in the future
        if (this.pointer < this.dateStart) {
            this.displayStart = new Date(this.dateStart.getTime());
            this.touchLeft = true;
        }
        //move pointer to the last months of the project if end date is in the past
        else if (this.pointer > this.dateEnd) {
            //just set it to the end, it will be moved left later
            //clone end date
            this.displayStart = new Date(this.dateEnd.getTime());
        }
        //in all other situation, the pointer should be now
        else {
            this.displayStart = new Date(this.pointer.getTime());
        }

        //see if we are before start (this can happen in some situations in above code)
        if (this.displayStart <= this.dateStart) {
            this.touchLeft = true;
            this.displayStart = this. dateStart;
        }

        //done setting display start. check display end. it is OK if displayEnd leaks out of projectEnd, but we need to indicate that it does so
        //first clone date object
        this.displayEnd = new Date(this.displayStart.getTime());
        //then add x months to displaystart
        this.displayEnd.setMonth(this.displayStart.getMonth() + (this.windowSize - 1));
        //see if window leaks out of project end
        if (this.displayEnd >= this.dateEnd){
            this.touchRight = true;

            // move window to the left if the duration allows it
            if (this.startToEndMonthCount >= this.windowSize){
                // clone end date and subtract windows size from end date clone
                this.displayStart = new Date(this.dateEnd.getFullYear(), this.dateEnd.getMonth() - (this.windowSize - 1), this.dateEnd.getDate());
                // we touch left if duration is equal in size with the desired window.
                // otherwise, the startToEndMonthCount is larger and we are not touching left
                this.touchLeft = (this.startToEndMonthCount === this.windowSize);
            }
            //otherwise, move to the very left
            else {
                this.displayStart = new Date(this.dateStart.getTime());
                this.touchLeft = true;
            }

            //again, calculate displayEnd because start might have changed
            //add x months to displaystart
            this.displayEnd = new Date(this.displayStart.getTime());
            this.displayEnd.setMonth(this.displayStart.getMonth() + (this.windowSize - 1)); //to check if window leaks out of project

            //and again, see if the display end leaks out and set displayEnd to dateEnd if so
            if (this.displayEnd >= this.dateEnd){
                this.displayEnd = this.dateEnd;
            }
        }

        this.calculated = true;
    }

    getWindowStart() {
        if (!this.calculated) {
            return null;
        }

        return this.displayStart;
    }

    /**
     * Returns a string in the format YYYY-MM-DD
     */
    getWindowStartString () {
        return dateToYmd(this.getWindowStart());
    }

    getWindowStartStringNoDay() {
        return dateToYm(this.getWindowStart());
    }

    getWindowEnd() {
        if (!this.calculated) {
            return null;
        }

        return this.displayEnd;
    }

    getWindowEndString () {
        return dateToYmd(this.getWindowEnd());
    }

    getTouchLeft() {
        if (!this.calculated) {
            return null;
        }

        return this.touchLeft;
    }

    getTouchRight() {
        if (!this.calculated) {
            return null;
        }

        return this.touchRight;
    }
}

/**
 * Compares two YM Date strings. Returns true if the first string is greater (ie. later) than the second string.
 * @param dateStringYm1
 * @param dateStringYm2
 * @returns {boolean}
 */
function ymGtYm(dateStringYm1, dateStringYm2){
    "use strict";

    const date1 = dateStringYm1.split("-");
    const date2 = dateStringYm2.split("-");

    const year1 = parseInt(date1[0]);
    const year2 = parseInt(date2[0]);

    // first is actually later
    if (year1 > year2) {
        return true;
    }
    // second is actually later
    else if (year1 < year2) {
        return false;
    }
    // both years are the same, we have to compare months
    else {
        const month1 = parseInt(date1[1]);
        const month2 = parseInt(date2[1]);

        return month1 > month2;
    }
}

function ymToInt(dateStringYm){
    "use strict";

    if (typeof dateStringYm !== "string") return null;
    return parseInt(dateStringYm.slice(0,4) + dateStringYm.slice(5, 7));
}

function intToYm(datelikeInt){
    "use strict";

    //convert to string if number and check type
    let dateStringWithoutDash = datelikeInt;
    if (typeof datelikeInt === "number") {
        dateStringWithoutDash = datelikeInt.toString();
    }
    if (typeof dateStringWithoutDash !== "string") return null;

    return dateStringWithoutDash.slice(0,4) + "-" + dateStringWithoutDash.slice(4,6);
}

/**
 * Takes 2017-01-15 and returns 20170115
 * @param dateStringYmd
 * @returns {*}
 */
function ymdToInt(dateStringYmd){
    "use strict";

    if (typeof dateStringYmd !== "string") return null;
    return parseInt(dateStringYmd.slice(0,4) + dateStringYmd.slice(5, 7) + dateStringYmd.slice(8,10));
}

function intToYmd(datelikeInt){
    "use strict";

    //convert to string if number and check type
    let dateStringWithoutDash = datelikeInt;

    if (typeof datelikeInt === "number") {
        if (datelikeInt > 99991231) {
            throw new Error("Maximum supported date is 9999-12-31");
        } else if (datelikeInt < 10000101){
            throw new Error("Minimum supported date is 1000-01-01");
        }
        dateStringWithoutDash = datelikeInt.toString();
    }
    else if (typeof datelikeInt === "string") {
        if (datelikeInt.length !== 8){
            throw new Error("Expecting a string or number with 10 characters")
        }
    }
    else {
        throw new Error("Expecting number or string");
    }

    return dateStringWithoutDash.slice(0,4) + "-" + dateStringWithoutDash.slice(4,6) + "-" + dateStringWithoutDash.slice(6,10);
}

module.exports = {
    ymdToInt: ymdToInt,
    ymdToDate: ymdToDate,
    dmyToDate: dmyToDate,
    dmyToYmd: dmyToYmd,
    ymToDate: ymToDate,
    dateToYmd: dateToYmd,
    dateToYm: dateToYm,
    dateToDmy: dateToDmy,
    ymOffset: ymOffset,
    getEnglishWeekday: getEnglishWeekday,
    getGermanWeekday: getGermanWeekday,
    countMonthsInPeriod: countMonthsInPeriod,
    monthDiff: monthDiff,
    TimeWindow: TimeWindow,
    ymGtYm: ymGtYm,
    ymToInt: ymToInt,
    intToYm: intToYm,
    intToYmd: intToYmd,
    ymdOffsetIgnoreDay: ymdOffsetIgnoreDay,
};