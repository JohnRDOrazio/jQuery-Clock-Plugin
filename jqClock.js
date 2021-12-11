/**
 * jQuery Clock plugin
 * Copyright (c) 2010 John R D'Orazio (priest@johnromanodorazio.com)
 * Licensed under the Apache 2.0 license:
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Turns a jQuery dom element into a dynamic clock
 * Sets time in clock div and calls itself every second
 * Can take options as JSON object
 * Possible options parameters:
 * @timestamp defaults to clients current time
 * @timezone defaults to detection of client timezone, but can be passed in as a string such as "UTC-6" when using server generated timestamps
 * @langSet defaults to "en", possible values are: "am", "ar", "bn", "bg", "ca", "zh", "hr", "cs", "da", "nl", "en", "et", "fi", "fr", "de", "el", "gu", "hi", "hu", "id", "it", "ja", "kn", "ko", "lv", "lt", "ms", "ml", "mr", "mo", "ps", "fa", "pl", "pt", "ro", "ru", "sr", "sk", "sl", "es", "sw", "sv", "ta", "te", "th", "tr", "uk", "vi"
 * @calendar defaults to "true", possible value are: boolean "true" or "false"
 * @dateFormat defaults to "l, F j, Y" when langSet=="en", else to "l, j F Y"
 * @timeFormat defaults to "h:i:s A" when langSet=="en", else to "H:i:s"
 * @isDST possible values are boolean "true" or "false", if not passed in will calculate based on client time
 *
 *   $("#mydiv").clock(); >> will display in English and in 12 hour format
 *   $("#mydiv").clock({"langSet":"it"}); >> will display in Italian and in 24 hour format
 *   $("#mydiv").clock({"langSet":"en","timeFormat":"H:i:s"}); >> will display in English but in 24 hour format
 *   $("#mydiv").clock({"calendar":false}); >> will remove the date from the clock and display only the time
 *
 *   Custom timestamp example, say we have a hidden input with id='timestmp' the value of which is determined server-side with server's current time:
 *
 *   <input type="hidden" id="timestmp" value="<?php echo time(); ?>" />
 *   tmstmp = parseInt($("#timestmp").val());
 *   $("#mydiv").clock({"timestamp":tmstmp});
 *   >> will turn div into clock passing in server's current time as retrieved from hidden input
 *
 */

//THE FOLLOWING EXTENSION OF THE DATE PROTOTYPE WAS TAKEN FROM: https://stackoverflow.com/a/26778394/394921
if (!Date.prototype.hasOwnProperty("stdTimezoneOffset")) {
    Date.prototype.stdTimezoneOffset = function () {
        var fy = this.getFullYear();
        if (!Date.prototype.stdTimezoneOffset.cache.hasOwnProperty(fy)) {
            var maxOffset = new Date(fy, 0, 1).getTimezoneOffset();
            var monthsTestOrder = [6, 7, 5, 8, 4, 9, 3, 10, 2, 11, 1];

            for (var mi = 0; mi < 12; mi++) {
                var offset = new Date(
                    fy,
                    monthsTestOrder[mi],
                    1
                ).getTimezoneOffset();
                if (offset != maxOffset) {
                    maxOffset = Math.max(maxOffset, offset);
                    break;
                }
            }
            Date.prototype.stdTimezoneOffset.cache[fy] = maxOffset;
        }
        return Date.prototype.stdTimezoneOffset.cache[fy];
    };
    Date.prototype.stdTimezoneOffset.cache = {};
}
if (!Date.prototype.hasOwnProperty("isDST")) {
    Date.prototype.isDST = function () {
        return this.getTimezoneOffset() < this.stdTimezoneOffset();
    };
}
if (!Date.prototype.hasOwnProperty("isLeapYear")) {
    //source: https://stackoverflow.com/a/26426761/394921
    Date.prototype.isLeapYear = function () {
        var year = this.getFullYear();
        if ((year & 3) != 0) return false;
        return year % 100 != 0 || year % 400 == 0;
    };
}
if (!Date.prototype.hasOwnProperty("getDOY")) {
    // Get Day of Year
    //source: https://stackoverflow.com/a/26426761/394921
    //maybe can use the solution [here](https://stackoverflow.com/a/28919172/394921) also: Math.round((new Date().setHours(23) - new Date(new Date().getYear()+1900, 0, 1, 0, 0, 0))/1000/60/60/24);
    Date.prototype.getDOY = function () {
        var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        var mn = this.getMonth();
        var dn = this.getDate();
        var dayOfYear = dayCount[mn] + dn;
        if (mn > 1 && this.isLeapYear()) dayOfYear++;
        return dayOfYear;
    };
}
if (!Date.prototype.hasOwnProperty("daysInMonth")) {
    //Get number of days in the current month
    //source: https://stackoverflow.com/questions/1184334/get-number-days-in-a-specified-month-using-javascript#comment36681053_1464716
    Date.prototype.daysInMonth = function () {
        return [
            31,
            this.isLeapYear() ? 29 : 28,
            31,
            30,
            31,
            30,
            31,
            31,
            30,
            31,
            30,
            31,
        ][this.getMonth()];
    };
}
if (!Date.prototype.hasOwnProperty("getWOY")) {
    //Get Week Number in the Year
    //source: https://stackoverflow.com/a/6117889/394921
    Date.prototype.getWOY = function (getY) {
        var d = new Date(+this);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        if (getY) {
            return d.getFullYear();
        } else {
            return Math.ceil(
                ((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7 + 1) / 7
            );
        }
    };
}
if (!Date.prototype.hasOwnProperty("swatchTime")) {
    //Get Swatch Internet Time
    //source: https://gist.github.com/rev22/8085260
    Date.prototype.swatchTime = function () {
        return (
            "00" +
            Math.floor(
                ((((this.getUTCHours() + 1) % 24) * 60 + this.getUTCMinutes()) *
                    60 +
                    this.getUTCSeconds() +
                    this.getUTCMilliseconds() * 0.001) /
                    86.4
            )
        ).slice(-3);
    };
}
//END DATE PROTOTYPE EXTENSION

//Most browsers support String.prototype.padStart, unfortunately Internet Explorer does not... So this is to make sure it is available
// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
    String.prototype.padStart = function (targetLength, padString) {
        targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
        padString = String(padString || " ");
        if (this.length > targetLength) {
            return String(this);
        } else {
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + String(this);
        }
    };
}
//END STRING.PROTOTYPE.PADSTART

//Let's implement a Number.map function
//source:https://stackoverflow.com/questions/10756313/javascript-jquery-map-a-range-of-numbers-to-another-range-of-numbers#comment40722057_23202637
if (!Number.prototype.map) {
    Number.prototype.map = function (a, b, c, d) {
        return c + (d - c) * ((this - a) / (b - a));
    };
}
//END NUMBER.PROTOTYPE.MAP

/* Might be able to use performance.now:
 * https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
 * Unlike other timing data available to JavaScript (for example Date.now),
 * the timestamps returned by Performance.now() are not limited to one-millisecond resolution.
 * Instead, they represent times as floating-point numbers with up to microsecond precision.
 * Also unlike Date.now(), the values returned by Performance.now() always increase at a constant rate,
 * independent of the system clock (which might be adjusted manually or skewed by software like NTP).
 * Otherwise, performance.timeOrigin + performance.now() will be approximately equal to Date.now(). <<<<<<<<
 * See also https://developers.google.com/web/updates/2012/08/When-milliseconds-are-not-enough-performance-now
 */

//BEGIN JQUERY CLOCK PLUGIN
(($) => {
    $.clock = {
        version: "2.3.6",
        options: [
            {
                type: "string",
                value: "destroy",
                description:
                    "Passing in 'destroy' to an already initialized clock will remove the setTimeout for that clock to stop it from ticking, and remove all html markup and data associated with the plugin instance on the dom elements",
            },
            {
                type: "string",
                value: "stop",
                description:
                    "Passing in 'stop' to an already initialized clock will clear the setTimeout for that clock to stop it from ticking",
            },
            {
                type: "string",
                value: "start",
                description:
                    "Passing in 'start' to an already initialized clock will restart the setTimeout for that clock to get it ticking again, as though it had never lost time",
            },
            {
                type: "object",
                description: "option set {}",
                values: [
                    {
                        name: "timestamp",
                        description:
                            "Either a javascript timestamp as produces by [JAVASCRIPT new Date().getTime()] or a php timestamp as produced by [PHP time()] ",
                        type: "unix timestamp",
                        values: ["javascript timestamp", "php timestamp"],
                    },
                    {
                        name: "langSet",
                        description:
                            "two letter locale to be used for the translation of Day names and Month names",
                        type: "String",
                        values: [
                            "am",
                            "ar",
                            "bn",
                            "bg",
                            "ca",
                            "zh",
                            "hr",
                            "cs",
                            "da",
                            "nl",
                            "en",
                            "et",
                            "fi",
                            "fr",
                            "de",
                            "el",
                            "gu",
                            "hi",
                            "hu",
                            "id",
                            "it",
                            "ja",
                            "kn",
                            "ko",
                            "lv",
                            "lt",
                            "ms",
                            "ml",
                            "mr",
                            "mo",
                            "ps",
                            "fa",
                            "pl",
                            "pt",
                            "ro",
                            "ru",
                            "sr",
                            "sk",
                            "sl",
                            "es",
                            "sw",
                            "sv",
                            "ta",
                            "te",
                            "th",
                            "tr",
                            "uk",
                            "vi",
                        ],
                    },
                    {
                        name: "calendar",
                        description:
                            "Whether the date should be displayed together with the time",
                        type: "Boolean",
                        values: [true, false],
                    },
                    {
                        name: "dateFormat",
                        description:
                            "PHP Style Format string for formatting a local date, see http://php.net/manual/en/function.date.php",
                        type: "String",
                        values: [
                            "d",
                            "D",
                            "j",
                            "l",
                            "N",
                            "S",
                            "w",
                            "z",
                            "W",
                            "F",
                            "m",
                            "M",
                            "n",
                            "t",
                            "L",
                            "o",
                            "Y",
                            "y",
                        ],
                    },
                    {
                        name: "timeFormat",
                        description:
                            "PHP Style Format string for formatting a local date, see http://php.net/manual/en/function.date.php",
                        type: "String",
                        values: [
                            "a",
                            "A",
                            "B",
                            "g",
                            "G",
                            "h",
                            "H",
                            "i",
                            "s",
                            "v",
                            "e",
                            "I",
                            "O",
                            "P",
                            "Z",
                            "c",
                            "r",
                            "U",
                        ],
                    },
                    {
                        name: "isDST",
                        description:
                            "When a client side timestamp is used, whether DST is active will be automatically determined. However this cannot be determined for a server-side timestamp which must be passed in as UTC, in that can case it can be set with this option",
                        type: "Boolean",
                        values: [true, false],
                    },
                    {
                        name: "rate",
                        description:
                            "Defines the rate at which the clock will update, in milliseconds",
                        type: "Integer",
                        values: "1 - 9007199254740991 (recommended 10-60000)",
                    },
                ],
            },
        ],
        methods: {
            destroy:
                "Chaining clock().destroy() has the same effect as passing the 'destroy' option as in clock('destroy')",
            stop: "Chaining clock().stop() has the same effect as passing the 'stop' option as in clock('stop')",
            start: "Chaining clock().start() has the same effect as passing the 'start' option as in clock('start')",
        },
    };
    Object.freeze($.clock);

    //_jqClock contains references to each clock's settimeouts
    var _jqClock = _jqClock || {};

    $.fn.clock = function (options) {
        let _this = this;

        this.initialize = function () {
            return this;
        };

        this.destroy = () => {
            return _this.each((idx,selfRef) => {
                pluginMethods["destroy"](selfRef);
            });
        };
        this.stop = () => {
            return _this.each((idx,selfRef) => {
                pluginMethods["stop"](selfRef);
            });
        };

        this.start = () => {
            return _this.each((idx,selfRef) => {
                pluginMethods["start"](selfRef);
            });
        };

        const dateFormatCharacters = {
            //DAY
            //Day of the Month, 2 digits with leading zeros
            "d": ( clk ) => ("" + clk.dt).padStart(2, "0"),
            //A textual representation of a day, three letters
            "D": ( clk ) => new Intl.DateTimeFormat(
                clk.myoptions.langSet,
                {
                    weekday: "short",
                }
            ).format(clk.mytimestamp_sysdiff),
            //Day of the month without leading zeros
            "j": ( clk ) => clk.dt,
            //A full textual representation of the day of the week
            "l": ( clk ) => new Intl.DateTimeFormat(
                clk.myoptions.langSet,
                {
                    weekday: "long",
                }
            ).format(clk.mytimestamp_sysdiff),
            // ISO-8601 numeric representation of the day of the week (1-7, 1=Monday)
            "N": ( clk ) => clk.dy === 0 ? 7 : clk.dy,
            //English ordinal suffix for the day of the month, 2 characters
            "S": ( clk ) => _ordSuffix(clk.dt),
            //Numeric representation of the day of the week (0-6, 0=Sunday)
            "w": ( clk ) => clk.dy,
            //The day of the year (starting from 0)
            "z": ( clk ) => clk.doy - 1,

            //WEEK
            // ISO-8601 week number of year, weeks starting on Monday
            "W": ( clk ) => clk.woy,

            //MONTH
            //A full textual representation of a month, such as January or March
            "F": ( clk ) => new Intl.DateTimeFormat(
                clk.myoptions.langSet,
                {
                    month: "long",
                }
            ).format(clk.mytimestamp_sysdiff),
            //Numeric representation of a month, with leading zeros
            "m": ( clk ) => (clk.mo + 1 + "").padStart(2, "0"),
            //A short textual representation of a month, three letters
            "M": ( clk ) => new Intl.DateTimeFormat(
                clk.myoptions.langSet,
                {
                    month: "short",
                }
            ).format(clk.mytimestamp_sysdiff),
            //Numeric representation of a month, without leading zeros
            "n": ( clk ) => clk.mo + 1,
            //Number of days in the given month
            "t": ( clk ) => clk.dim,
            // Whether it's a leap year
            "L": ( clk ) => clk.ly ? 1 : 0,
            //ISO-8601 week-numbering year. This has the same value as Y,
            //except that if the ISO week number (W) belongs to the previous or next year,
            //that year is used instead
            "o": ( clk ) => clk.iso8601Year,
            //A full numeric representation of a year, 4 digits
            "Y": ( clk ) => clk.y,
            //A two digit representation of a year
            "y": ( clk ) => clk.y.toString().substr(2, 2)
        },
        timeFormatCharacters = {
            //Lowercase Ante meridiem and Post meridiem
            "a": ( clk ) => clk.ap.toLowerCase(),
            //Uppercase Ante meridiem and Post meridiem
            "A": ( clk ) => clk.ap,
            //Swatch Internet time (000 through 999)
            "B": ( clk ) => clk.swt,
            //12-hour format of an hour without leading zeros
            "g": ( clk ) => clk.H12,
            //24-hour format of an hour without leading zeros
            "G": ( clk ) => clk.h,
            //12-hour format of an hour with leading zeros
            "h": ( clk ) => ("" + clk.H12).padStart(2, "0"),
            //24-hour format of an hour with leading zeros
            "H": ( clk ) => ("" + clk.h).padStart(2, "0"),
            //Minutes with leading zeros
            "i": ( clk ) => ("" + clk.m).padStart(2, "0"),
            //Seconds, with leading zeros
            "s": ( clk ) => ("" + clk.s).padStart(2, "0"),
            //Microseconds
            "u": ( clk ) => ("" + clk.ms).padStart(3, "0") +
                ("" + clk.us).padStart(3, "0"),
            //Milliseconds
            "v": ( clk ) => ("" + clk.ms).padStart(3, "0"),

            //TIMEZONE
            //Timezone identifier
            "e": ( clk ) => clk.myoptions.timezone,
            //Whether or not the date is in daylight saving time
            "I": ( clk ) => clk.myoptions.isDST ? "DST" : "",
            //Difference to Greenwich time (GMT) in hours
            "O": ( clk ) => (clk.tzH < 0
                        ? "+" +
                        ("" + Math.abs(clk.tzH)).padStart(2, "0")
                        : tzH > 0
                        ? ("" + clk.tzH * -1).padStart(2, "0")
                        : "+00") + "00",
            //Difference to Greenwich time (GMT) with colon between hours and minutes
            "P": ( clk ) => (clk.tzH < 0
                        ? "+" +
                        ("" + Math.abs(clk.tzH)).padStart(2, "0")
                        : clk.tzH > 0
                        ? ("" + clk.tzH * -1).padStart(2, "0")
                        : "+00") + ":00",
            //Timezone abbreviation
            /*"T": ( clk ) => timezone_abbrev...*/
            //Timezone offset in seconds. The offset for timezones west of UTC is always negative, and for those east of UTC is always positive.
            "Z": ( clk ) => clk.tzS < 0
                        ? "" + Math.abs(clk.tzS)
                        : clk.tzS > 0
                        ? "" + clk.tzS * -1
                        : "0",

            //FULL DATE/TIME
            // ISO 8601 date | Example 2004-02-12T15:19:21+00:00
            "c": ( clk ) => clk.y +
                    "-" +
                    (clk.mo + 1 + "").padStart(2, "0") +
                    "-" +
                    ("" + clk.dt).padStart(2, "0") +
                    "T" +
                    ("" + clk.h).padStart(2, "0") +
                    ":" +
                    ("" + clk.m).padStart(2, "0") +
                    ":" +
                    ("" + clk.s).padStart(2, "0") +
                    (clk.tzH < 0
                        ? "+" +
                        ("" + Math.abs(clk.tzH)).padStart(2, "0")
                        : tzh > 0
                        ? ("" + clk.tzh * -1).padStart(2, "0")
                        : "+00") +
                    ":00",
            //» RFC 2822 formatted date | Example: Thu, 21 Dec 2000 16:01:07 +0200
            "r": ( clk ) => new Intl.DateTimeFormat(clk.myoptions.langSet, {
                        weekday: "short",
                    }).format(clk.mytimestamp_sysdiff) +
                    ", " +
                    clk.dt +
                    " " +
                    new Intl.DateTimeFormat(clk.myoptions.langSet, {
                        month: "short",
                    }).format(clk.mytimestamp_sysdiff) +
                    " " +
                    clk.y +
                    " " +
                    ("" + clk.h).padStart(2, "0") +
                    ":" +
                    ("" + clk.m).padStart(2, "0") +
                    ":" +
                    ("" + clk.s).padStart(2, "0") +
                    " " +
                    (clk.tzH < 0
                        ? "+" +
                        ("" + Math.abs(clk.tzH)).padStart(2, "0")
                        : clk.tzh > 0
                        ? ("" + clk.tzh * -1).padStart(2, "0")
                        : "+00") +
                    "00",
            //Seconds since the Unix Epoch
            "U": ( clk ) => Math.floor(clk.mytimestamp / 1000)
        },
        pluginMethods = {
            "destroy": ( selfRef ) => {
                let el_id = $(selfRef).attr("id");
                if (_jqClock.hasOwnProperty(el_id)) {
                    clearTimeout(_jqClock[el_id]);
                    delete _jqClock[el_id];
                }
                $(selfRef).html("");
                if ($(selfRef).hasClass("jqclock")) {
                    $(selfRef).removeClass("jqclock");
                }
                $(selfRef).removeData("clockoptions");
            },
            "stop": ( selfRef ) => {
                let el_id = $(selfRef).attr("id");
                if (_jqClock.hasOwnProperty(el_id)) {
                    clearTimeout(_jqClock[el_id]);
                    delete _jqClock[el_id];
                }
            },
            "start": ( selfRef ) => {
                let el_id = $(selfRef).attr("id");
                let current_options = $(selfRef).data("clockoptions");
                if (
                    current_options !== undefined &&
                    _jqClock.hasOwnProperty(el_id) === false
                ) {
                    _jqClock[el_id] = setTimeout(function () {
                        _updateClock($(selfRef));
                    }, current_options.rate);
                }
            }
        };

        /* Define some helper functions */
        let _newGuid = () => {
                return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
                    .replace(/[xy]/g, function (c) {
                        let r = (Math.random() * 16) | 0,
                            v = c == "x" ? r : (r & 0x3) | 0x8;
                        return v.toString(16);
                    })
                    .toUpperCase();
            },
            _ordSuffix = (ord) => {
                let ord_suffix = ""; //st, nd, rd, th
                if (ord === 1 || (ord % 10 === 1 && ord != 11)) {
                    ord_suffix = "st";
                } else if (ord === 2 || (ord % 10 === 2 && ord != 12)) {
                    ord_suffix = "nd";
                } else if (ord === 3 || (ord % 10 === 3 && ord != 13)) {
                    ord_suffix = "rd";
                } else {
                    ord_suffix = "th";
                }
                return ord_suffix;
            },
            _updateClock = (el) => {
                let clk = {};
                clk.myoptions = $(el).data("clockoptions");
                //since system time and timezones affect the Date object, let's make sure it's not going to affect our clock:
                clk.currentTzOffset = new Date().getTimezoneOffset();
                clk.correction =
                    clk.currentTzOffset === clk.myoptions.tzOffset
                        ? 0
                        : (clk.currentTzOffset - clk.myoptions.tzOffset) * 60 * 1000;

                clk.pfnow = performance.now();
                //get our new timestamp with all the timezone offsets and corrections !!!
                //corrected and re-corrected !!!
                clk.mytimestamp =
                    performance.timeOrigin +
                    clk.pfnow +
                    clk.myoptions.sysdiff +
                    clk.correction;

                clk.mytimestamp_sysdiff = new Date(clk.mytimestamp);
                clk.h = clk.mytimestamp_sysdiff.getHours();
                clk.m = clk.mytimestamp_sysdiff.getMinutes();
                clk.s = clk.mytimestamp_sysdiff.getSeconds();
                clk.ms = clk.mytimestamp_sysdiff.getMilliseconds();
                clk.us = ("" + (clk.pfnow % 1)).substring(2, 5);
                clk.dy = clk.mytimestamp_sysdiff.getDay();
                clk.dt = clk.mytimestamp_sysdiff.getDate();
                clk.mo = clk.mytimestamp_sysdiff.getMonth();
                clk.y = clk.mytimestamp_sysdiff.getFullYear();
                clk.ly = clk.mytimestamp_sysdiff.isLeapYear();
                clk.doy = clk.mytimestamp_sysdiff.getDOY();
                clk.woy = clk.mytimestamp_sysdiff.getWOY();
                clk.iso8601Year = clk.mytimestamp_sysdiff.getWOY(true);
                clk.dim = clk.mytimestamp_sysdiff.daysInMonth();
                clk.swt = clk.mytimestamp_sysdiff.swatchTime();
                clk.tzH = parseInt(clk.myoptions.tzOffset / 60);
                clk.tzS = parseInt(clk.myoptions.tzOffset * 60);
                clk.ap = "AM";
                clk.calendElem = "";
                clk.clockElem = "";
                if (clk.h > 11) {
                    clk.ap = "PM";
                }
                clk.H12 = clk.h;
                if (clk.H12 > 12) {
                    clk.H12 = clk.H12 - 12;
                } else if (clk.H12 === 0) {
                    clk.H12 = 12;
                }

                if (clk.myoptions.calendar === true) {
                    clk.calendElem = formatDateString( clk );
                }

                clk.clockElem = formatTimeString( clk );

                $(el).html(clk.calendElem + clk.clockElem);
                let el_id = $(el).attr("id");
                _jqClock[el_id] = setTimeout(() => {
                    _updateClock( $(el) );
                }, clk.myoptions.rate);
            },
            formatDateString = ( clk ) => {
                    /* Format Date String according to PHP style Format Characters http://php.net/manual/en/function.date.php */
                    let dateStr = "";
                    let chr;
                    const { myoptions } = clk;
                    for (var n = 0; n <= myoptions.dateFormat.length; n++) {
                        chr = myoptions.dateFormat.charAt(n);
                        if( chr in dateFormatCharacters ) {
                            dateStr += dateFormatCharacters[chr]( clk );
                        } else{
                            switch (chr) {
                                case String.fromCharCode(92): //backslash character, which would have to be a double backslash in the original string!!!
                                    dateStr += myoptions.dateFormat.charAt(++n);
                                    break;
                                case "%":
                                    [ dateStr, n ] = processLiterals( myoptions, n, true, dateStr, chr );
                                    break;
                                default:
                                    dateStr += chr;
                            }
                        }
                    }
                    return '<span class="clockdate">' + dateStr + "</span>";
            },
            formatTimeString = ( clk ) => {
                /* Prepare Time String using PHP style Format Characters http://php.net/manual/en/function.date.php */
                let timeStr = "";
                let chr;
                const { myoptions } = clk;
                for (var n = 0; n <= myoptions.timeFormat.length; n++) {
                    chr = myoptions.timeFormat.charAt(n);
                    if( chr in timeFormatCharacters ) {
                        timeStr += timeFormatCharacters[chr]( clk );
                    } else {
                        switch (chr) {
                            case String.fromCharCode(92): //backslash character, which would have to be a double backslash in the original string!!!
                                timeStr += myoptions.timeFormat.charAt(++n);
                                break;
                            case "%":
                                [ timeStr, n ] = processLiterals( myoptions, n, false, timeStr, chr );
                                break;
                            default:
                                timeStr += chr;
                        }
                    }
                }
                return '<span class="clocktime">' + timeStr + '</span>';
            },
            ensureDefaultOptions = ( options, sysDateObj ) => {
                options = options || {};
                /* I prefer this method to jQuery.extend because we can dynamically set each option based on a preceding option's value */
                options.timestamp = options.timestamp || "localsystime";
                options.langSet = options.langSet || "en";
                options.calendar = options.hasOwnProperty("calendar")
                    ? options.calendar
                    : true;
                options.dateFormat =
                    options.dateFormat ||
                    (options.langSet == "en" ? "l, F j, Y" : "l, j F Y");
                options.timeFormat =
                    options.timeFormat ||
                    (options.langSet == "en" ? "h:i:s A" : "H:i:s");
                options.timezone = options.timezone || "localsystimezone"; //should only really be passed in when a server timestamp is passed
                options.isDST = options.hasOwnProperty("isDST")
                    ? options.isDST
                    : sysDateObj.isDST(); //should only really be passed in when a server timestamp is passed
                options.rate = options.rate || 500; //500ms makes for a more faithful clock than 1000ms, less skewing
                return options;
            },
            normalizeOptions = (options) => {
                //ensure we have correct value types
                if (typeof options.langSet !== "string") {
                    options.langSet = "" + options.langSet;
                }
                if (typeof options.calendar === "string") {
                    options.calendar = Boolean(
                        options.calendar == "false" ? false : true
                    );
                } else if (typeof options.calendar !== "boolean") {
                    options.calendar = Boolean(options.calendar); //do our best to get a boolean value
                }
                if (typeof options.dateFormat !== "string") {
                    options.dateFormat = "" + options.dateFormat;
                }
                if (typeof options.timeFormat !== "string") {
                    options.timeFormat = "" + options.dateFormat;
                }
                if (typeof options.timezone !== "string") {
                    options.timezone = "" + options.timezone;
                }
                if (typeof options.isDST === "string") {
                    options.isDST = Boolean(
                        options.isDST == "true" ? true : false
                    );
                } else if (typeof options.isDST !== "boolean") {
                    options.isDST = Boolean(options.isDST);
                }
                if (typeof options.rate !== "number") {
                    options.rate = parseInt(options.rate); //do our best to get an int value
                }
                return options;
            },
            processLiterals = ( myoptions, n, forDateStr, currStr, currentChr ) => {
                let pos = n + 1;
                let str = forDateStr ? myoptions.dateFormat : myoptions.timeFormat;
                while (pos < str.length) {
                    if (str.charAt(pos) == "%") {
                        break;
                    }
                    pos++;
                }
                if (pos > n + 1 && pos != str.length) {
                    currStr += str.substring(n + 1, pos);
                    n += pos - n;
                } else {
                    currStr += currentChr;
                }
                return [ currStr, n ];
            },
            seemsToBePHPTimestamp = ( options, sysDateObj ) => {
                let digitCountDiff =
                (sysDateObj.getTime() + "").length -
                (options.timestamp + "").length;
                return digitCountDiff > 2;
            },
            normalizePHPTimestamp = ( options, sysDateObj ) => {
                options.timestamp = options.timestamp * 1000;
                options.sysdiff =
                    options.timestamp -
                    sysDateObj.getTime() +
                    options.tzOffset * 60 * 1000;
                //options.timezone has most probably been set in this case
                return options;
            },
            initTimezone = ( options, tzOffset ) => {
                options.timezone = "UTC";
                let rmn = tzOffset % 1;
                tzOffset = tzOffset - rmn;
                let suffix = "";
                if (Math.abs(rmn) !== 0) {
                    suffix = "" + Math.abs(rmn).map(0, 1, 0, 60);
                }
                if (tzOffset < 0) {
                    options.timezone +=
                        "+" +
                        Math.abs(tzOffset) +
                        (suffix !== "" ? ":" + suffix : "");
                } else if (tzOffset > 0) {
                    options.timezone +=
                        tzOffset * -1 +
                        (suffix !== "" ? ":" + suffix : "");
                }
                return options;
            },
            initInstance = ( selfRef, options ) => {
                if (!$(selfRef).hasClass("jqclock")) {
                    $(selfRef).addClass("jqclock");
                }
                if (!$(selfRef).is("[id]")) {
                    $(selfRef).attr("id", _newGuid());
                }
                $(selfRef).data("clockoptions", options);
                //only allow one associated settimeout at a time! basically, only one plugin instance per dom element
                if (_jqClock.hasOwnProperty($(selfRef).attr("id")) === false) {
                    _updateClock($(selfRef));
                }
            };

        this.each(() => {
            if (typeof options === "undefined" || typeof options === "object") {
                //this is useful only for client timestamps...
                //used immediately for the default value of options.isDST...
                let highPrecisionTimestamp =
                    performance.timeOrigin + performance.now();
                let sysDateObj = new Date(highPrecisionTimestamp);
                //TODO: if server timestamp is passed in and options.isDST is not, then options.isDST isn't any good...
                //       no use using a client timestamps check for DST when a server timestamp is passed!

                options = ensureDefaultOptions( options, sysDateObj );
                options = normalizeOptions( options );

                /*****************************|
                |* Non user passable options *|
                |*****************************/
                //getTimezoneOffset gives minutes
                options.tzOffset = sysDateObj.getTimezoneOffset();

                //divide by 60 to get hours from minutes
                let tzOffset = options.tzOffset / 60;

                /* **********************************************
                 * If we are using the current client timestamp,
                 * our difference from local system time will be calculated as zero
                 */
                options.sysdiff = 0;

                /* **********************************************
                 * If instead we are using a custom timestamp,
                 * we will need to calculate the difference from local system time
                 *   >> in the case that it is a server timestamp our difference from local system time will be calculated as:
                 *      ((server time * 1000) - local system time) + local timezoneoffset
                 *   >> in the case that it is a client timestamp our difference from local system time will be calculated as:
                 *      (customtimestamp - local system time)
                 */

                //IF A TIMESTAMP HAS BEEN PASSED IN
                if (options.timestamp != "localsystime") {
                    if ( seemsToBePHPTimestamp( options, sysDateObj ) ) {
                        options = normalizePHPTimestamp( options );
                    }
                    else {
                        options.sysdiff = options.timestamp - sysDateObj.getTime();
                        /* ARE THE NEXT FEW LINES AT ALL USEFUL??? */
                        //options.timezone has most probably not been set, let's do some guesswork
                        if (options.timezone == "localsystimezone") {
                            options = initTimezone( options, tzOffset );
                        }
                        /* MIGHT WANT TO DOUBLE CHECK IF THE PRECEDING LOGIC IS AT ALL USEFUL... */
                    }
                }

                //OTHERWISE IF NO TIMESTAMP HAS BEEN PASSED IN
                else {
                    //options.timezone has most probably not been set, let's do some guesswork
                    if (options.timezone == "localsystimezone") {
                        options = initTimezone( options, tzOffset );
                    }
                }

                /*********************************|
                |* END Non user passable options *|
                |*********************************/

                initInstance( this, options );
            } else if (typeof options === "string") {
                let selfRef = this;
                if( options in pluginMethods ) {
                    pluginMethods[options]( selfRef );
                } else {
                    console.error( "You are calling an undefined method on a jqClock instance" );
                }
            }
        });

        return this.initialize();
    };

    return this;
})(jQuery);
