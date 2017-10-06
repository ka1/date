import {monthDiff, countMonthsInPeriod, ymdToDate, dateToYmd} from "./ymdToDate.jsx";
import TimeWindow from "./ymdToDate.jsx";
import { dateToYm, ymToDate } from "./ymdToDate";

test("receive correct sample date", () => {
    expect(ymdToDate("2017-01-01")).toMatchObject(new Date(2017, 0, 1));
});

test("test for undefined", () => {
    expect(ymdToDate()).toBeNull();
});

test("edge case end of year, should be the same after converting back and forth", () => {
    let input = "2017-12-31";
    let convertedDate = ymdToDate(input);
    let output = dateToYmd(convertedDate);
    expect(input).toEqual(output);
});

test("edge case first day in year, should be the same after converting back and forth", () => {
    let input = "2040-01-01";
    let convertedDate = ymdToDate(input);
    let output = dateToYmd(convertedDate);
    expect(input).toEqual(output);
});

test("should export string of year and month of a date object", () => {
    let output = dateToYm(new Date(1971,0,1));
    expect(output).toEqual("1971-01");
});

test("should return the months in a period", () => {
    expect(countMonthsInPeriod("2017-01-31", "2017-03-01")).toBe(3);
});

test("should return 1 if both dates are in the same month", () => {
    expect(countMonthsInPeriod("2017-01-04", "2017-01-06")).toBe(1);
});

test("should return 0 if second date is before first date", () => {
    expect(countMonthsInPeriod("2017-01-04", "2015-01-06")).toBe(0);
});

test("should return null if one is undefined", () => {
    expect(countMonthsInPeriod("2017-01-31", undefined)).toBe(null);
    expect(countMonthsInPeriod(undefined, "2017-01-31")).toBe(null);
});

test("should return a date object with the last day of a month", () => {
    expect(ymToDate("2017-12").toUTCString()).toBe(new Date(2017,11,31).toUTCString());
    expect(ymToDate("2017-12",true).toUTCString()).toBe(new Date(2017,11,31).toUTCString());
});

test("should return a date object with the first day of a month", () => {
    expect(ymToDate("2017-01",false).toUTCString()).toBe(new Date(2017,0,1).toUTCString());
});

describe("test date diff modes", () => {
    let first = new Date("2012-01-01");
    let second = new Date("2012-02-12");

    test("should count zero months in strict mode", () => {
        expect(monthDiff(first, second, "STRICT")).toEqual(0);
    });

    test("should count one month in FULL mode", () => {
        expect(monthDiff(first, second, "FULL")).toEqual(1);
    });

    test("should count two months in GREEDY (default) mode", () => {
        expect(monthDiff(first, second, "GREEDY")).toEqual(2);
        expect(monthDiff(first, second)).toEqual(2);
    });
});

describe("time window class", () => {
    test("should move pointer to the start if window is in the future and indicate that we are touching left and right boundaries", () => {
        let tw = new TimeWindow("2051-01-01", "2051-02-01", 12);
        tw.calculateWindow();
        expect(tw.getWindowStartString()).toEqual("2051-01-01");
        expect(tw.getWindowStartStringNoDay()).toEqual("2051-01");
        expect(tw.getTouchLeft()).toBe(true);
        expect(tw.getTouchRight()).toBe(true);
    });

    test("should move pointer to the last months if window is in the past and indicate correct touches in small window", () => {
        let tw = new TimeWindow("1980-01-01", "1980-12-31", 24);
        tw.calculateWindow();
        expect(tw.getWindowStartString()).toEqual("1980-01-01");
        expect(tw.getWindowStartStringNoDay()).toEqual("1980-01");
        expect(tw.getTouchLeft()).toBe(true);
        expect(tw.getTouchRight()).toBe(true);
    });

    test("should move pointer to the last months if window is in the past and indicate correct touches in large window", () => {
        let tw = new TimeWindow("1980-01-01", "1980-12-31", 4);
        tw.calculateWindow();
        expect(tw.getWindowStartString()).toEqual("1980-09-01");
        expect(tw.getWindowStartStringNoDay()).toEqual("1980-09");
        expect(tw.getTouchLeft()).toBe(false);
        expect(tw.getTouchRight()).toBe(true);
    });

    test("should move pointer in full months", () => {
        let tw = new TimeWindow("2010-01-01", "2010-02-28", 2);
        tw.calculateWindow();
        expect(tw.getWindowStartString()).toEqual("2010-01-01");
        expect(tw.getWindowStartStringNoDay()).toEqual("2010-01");
        expect(tw.getWindowEndString()).toEqual("2010-02-01");
    });

    test("should not move pointer if within window", () => {
        let tw = new TimeWindow("2010-01-01", "2010-05-15", 3, "2010-02-10");
        tw.calculateWindow();
        expect(tw.getWindowStartString()).toEqual("2010-02-01");
        expect(tw.getWindowStartStringNoDay()).toEqual("2010-02");
        expect(tw.getWindowEndString()).toEqual("2010-04-01");
        expect(tw.getTouchLeft()).toBe(false);
        expect(tw.getTouchRight()).toBe(false);
    });

    test("should not move pointer if on the right side but within window", () => {
        let tw = new TimeWindow("2010-01-01", "2010-05-15", 3, "2010-03-09");
        tw.calculateWindow();
        expect(tw.getWindowStartString()).toEqual("2010-03-01");
        expect(tw.getWindowStartStringNoDay()).toEqual("2010-03");
        expect(tw.getWindowEndString()).toEqual("2010-05-01");
        expect(tw.getTouchLeft()).toBe(false);
        expect(tw.getTouchRight()).toBe(true);
    });

    test("should move pointer if on the right side lapping out of the window", () => {
        let tw = new TimeWindow("2010-01-01", "2010-05-15", 3, "2010-05-09");
        tw.calculateWindow();
        expect(tw.getWindowStartString()).toEqual("2010-03-01");
        expect(tw.getWindowStartStringNoDay()).toEqual("2010-03");
        expect(tw.getWindowEndString()).toEqual("2010-05-01");
        expect(tw.getTouchLeft()).toBe(false);
        expect(tw.getTouchRight()).toBe(true);
    });

    test("should move pointer if in a small window lapping out to the right.", () => {
        let tw = new TimeWindow("2010-01-01", "2010-02-15", 2, "2010-02-01");
        tw.calculateWindow();
        expect(tw.getWindowStartString()).toEqual("2010-01-01");
        expect(tw.getWindowStartStringNoDay()).toEqual("2010-01");
        expect(tw.getWindowEndString()).toEqual("2010-02-01");
        expect(tw.getTouchLeft()).toBe(true);
        expect(tw.getTouchRight()).toBe(true);
    });

    test("should move pointer to the left and output the correct end date, if windows overlap.", () => {
        let tw = new TimeWindow("2010-01-01", "2010-03-15", 12, "2010-02-01");
        tw.calculateWindow();
        expect(tw.getWindowStartString()).toEqual("2010-01-01");
        expect(tw.getWindowEndString()).toEqual("2010-03-01");
        expect(tw.getTouchLeft()).toBe(true);
        expect(tw.getTouchRight()).toBe(true);
    });
});

// export function ymdToDate(dateStr) {
//     "use strict";
//     if (dateStr === undefined) { return null; }
//     const [year, month, day] = dateStr.split("-");
//     return new Date(year, month - 1, day);
// }