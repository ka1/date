import {generateMonthListFromPeriod, generateMonthListBetweenTwoDates} from "./generateMonthListFromPeriod.jsx";

describe("generateMonthListFromPeriod", () => {
    it("should handle undefined and null in either field", () => {
        expect(generateMonthListFromPeriod("2017-01-01", null)).toBe(null);
        expect(generateMonthListFromPeriod(null, "2017-01-01")).toBe(null);
        expect(generateMonthListFromPeriod("2017-01-01", undefined)).toBe(null);
        expect(generateMonthListFromPeriod(undefined, "2017-01-01")).toBe(null);
    });
});

describe("generateMonthListBetweenTwoDates", () => {
    it("should return elements between dates", () => {
        expect(generateMonthListBetweenTwoDates("2017-01", "2017-03")).toEqual(["2017-01", "2017-02", "2017-03"]);
    });

    it("should handle wrong order", () => {
        expect(generateMonthListBetweenTwoDates("2017-03", "2017-01")).toEqual(["2017-01"]);
    });

    it("should handle uncomplete parameters", () => {
        expect(generateMonthListBetweenTwoDates("2017-03")).toEqual([]);
    });

});