/**
 * Convert a string to a date object. Expecting 2017-07-11.
 * @param dateStr
 * @returns {Date}
 */
export function ymdToDate(dateStr) {
    "use strict";
    if (dateStr === undefined || dateStr === null) { return null; }
    const [year, month, day] = dateStr.split("-");
    return new Date(year, month - 1, day);
}

export function dmyToDate(dateStr) {
    "use strict";
    if (dateStr === undefined || dateStr === null) { return null; }
    const [day, month, year] = dateStr.split(".");
    return new Date(year, month - 1, day);
}

export function dmyToYmd(dateStr) {
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

export function ymToDate(dateStr, getLastDay){
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

export function dateToYmd(dateObj) {
    "use strict";
    if (!(dateObj instanceof Date)) { return null; }

    const mm = dateObj.getMonth() + 1; // getMonth() is zero-based
    const dd = dateObj.getDate();

    return [dateObj.getFullYear(),
        (mm>9 ? "" : "0") + mm,
        (dd>9 ? "" : "0") + dd
    ].join("-");
}

export function dateToYm(dateObj) {
    "use strict";
    if (!(dateObj instanceof Date)) { return null; }

    const mm = dateObj.getMonth() + 1; // getMonth() is zero-based

    return [dateObj.getFullYear(),
        (mm>9 ? "" : "0") + mm
    ].join("-");
}

export function dateToDmy(dateObj) {
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
 * Receive the english name of the weekday
 * @param dateObj Date
 * @returns {*}
 */
export function getEnglishWeekday(dateObj) {
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
export function getGermanWeekday(dateObj) {
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
export function countMonthsInPeriod(startDateString, endDateString){
    "use strict";
    if (startDateString === undefined || endDateString === undefined){
        return null;
    }

    let start      = ymdToDate(startDateString);
    let end        = ymdToDate(endDateString);
    return monthDiff(start, end, "GREEDY");
}

export function monthDiff(d1, d2, mode="GREEDY") {
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


export default class TimeWindow {
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