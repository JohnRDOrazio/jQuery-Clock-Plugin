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
if(!Date.prototype.hasOwnProperty("stdTimezoneOffset")){
	Date.prototype.stdTimezoneOffset = function() {
		var fy=this.getFullYear();
		if (!Date.prototype.stdTimezoneOffset.cache.hasOwnProperty(fy)) {

			var maxOffset = new Date(fy, 0, 1).getTimezoneOffset();
			var monthsTestOrder=[6,7,5,8,4,9,3,10,2,11,1];

			for(var mi=0;mi<12;mi++) {
				var offset=new Date(fy, monthsTestOrder[mi], 1).getTimezoneOffset();
				if (offset!=maxOffset) { 
					maxOffset=Math.max(maxOffset,offset);
					break;
				}
			}
			Date.prototype.stdTimezoneOffset.cache[fy]=maxOffset;
		}
		return Date.prototype.stdTimezoneOffset.cache[fy];
	};
	Date.prototype.stdTimezoneOffset.cache={};
}
if(!Date.prototype.hasOwnProperty("isDST")){
	Date.prototype.isDST = function() {
		return this.getTimezoneOffset() < this.stdTimezoneOffset(); 
	};
}
//END DATE PROTOTYPE EXTENSION

//Most browsers support String.prototype.padStart, unfortunately Internet Explorer does not... So this is to make sure it is available
// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
        targetLength = targetLength>>0; //floor if number or convert non-number to 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0,targetLength) + String(this);
        }
    };
}
//END STRING.PROTOTYPE.PADSTART

/* Might be able to use performance.now: 
 * https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
 * Unlike other timing data available to JavaScript (for example Date.now), 
 * the timestamps returned by Performance.now() are not limited to one-millisecond resolution. 
 * Instead, they represent times as floating-point numbers with up to microsecond precision.
 * Also unlike Date.now(), the values returned by Performance.now() always increase at a constant rate, 
 * independent of the system clock (which might be adjusted manually or skewed by software like NTP). 
 * Otherwise, performance.timing.navigationStart + performance.now() will be approximately equal to Date.now(). <<<<<<<<
 * See also https://developers.google.com/web/updates/2012/08/When-milliseconds-are-not-enough-performance-now
 */

//BEGIN JQUERY CLOCK PLUGIN
(function($, undefined) {

	$.clock = {};
	Object.defineProperty($.clock,"version",{
	  value: "2.1.7",
	  writable: false
	});

	jqClock = [];

	$.fn.clock = function(options) {

		return this.each(function(){

			//this is useful only for client timestamps...
			var sysDateObj = new Date();

			options = options || {};
			
			/* User passable options: make sure we have default values if user doesn't pass them! */
			options.timestamp	= options.timestamp	|| "localsystime";
			options.langSet		= options.langSet	|| "en";
			options.calendar	= options.hasOwnProperty("calendar") ? options.calendar	: true;
			options.dateFormat	= options.dateFormat	|| ((options.langSet=="en") ? "l, F j, Y" : "l, j F Y");
			options.timeFormat	= options.timeFormat	|| ((options.langSet=="en") ? "h:i:s A" : "H:i:s");
			options.timezone	= options.timezone	|| "localsystimezone"; //should only really be passed in when a server timestamp is passed
			options.isDST		= options.hasOwnProperty("isDST") ? options.isDST : sysDateObj.isDST(); //should only really be passed in when a server timestamp is passed
			
			//ensure we have true boolean values
			if(typeof(options.calendar) === 'string'){
				options.calendar = Boolean(options.calendar == 'false' ? false : true);
			}
			if(typeof(options.isDST) === 'string'){
				options.isDST = Boolean(options.isDST == 'true' ? true : false);
			}
			
			/* Non user passable options */			
			//getTimezoneOffset gives minutes
			options.tzOffset = sysDateObj.getTimezoneOffset();
			//divide by 60 to get hours from minutes
			var tzOffset = options.tzOffset / 60;
			//If we are using the current client timestamp, our difference from local system time will be calculated as zero */
			options.sysdiff = 0;
			/* If instead we are using a custom timestamp, we need to calculate the difference from local system time
			 *   >> in the case that it is a server timestamp our difference from local system time will be calculated as:
			 *      ((server time * 1000) - local system time) + local timezoneoffset
			 *   >> in the case that it is a client timestamp our difference from local system time will be calculated as:
			 *      (customtimestamp - local system time)
			 */			
			if( options.timestamp != "localsystime" ){      
				var digitCountDiff = (sysDateObj.getTime()+'').length - (options.timestamp+'').length;
				if(digitCountDiff > 2){
					options.timestamp = options.timestamp * 1000;
					options.sysdiff = (options.timestamp - sysDateObj.getTime()) + (options.tzOffset*60*1000);
					//options.timezone has most probably been set in this case
				}
				else{
					options.sysdiff = options.timestamp - sysDateObj.getTime();
					//options.timezone has most probably not been set, let's do some guesswork
					if(options.timezone == "localsystimezone"){
						options.timezone = 'UTC';
						if(tzOffset < 0){ options.timezone += ('+' + Math.abs(tzOffset)); }
						else if(tzOffset > 0){ options.timezone += (tzOffset * -1); }
					}
				}
			}
			else{
				//options.timezone has most probably not been set, let's do some guesswork
				if(options.timezone == "localsystimezone"){
					options.timezone = 'UTC';
					if(tzOffset < 0){ options.timezone += ('+' + Math.abs(tzOffset)); }
					else if(tzOffset > 0){ options.timezone += (tzOffset * -1); }
				}
			}

			var newGuid = function() {
				return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
					function(c) {
						var r = Math.random() * 16 | 0,
						    v = c == 'x' ? r : (r & 0x3 | 0x8);
						return v.toString(16);
					}).toUpperCase();
			},
			updateClock = function(el,myoptions) {      
				var el_id = $(el).attr("id");
				if(myoptions=="destroy"){ clearTimeout(jqClock[el_id]); }
				else {
					var mytimestamp = new Date().getTime() + myoptions.sysdiff;
					var mytimestamp_sysdiff = new Date(mytimestamp);
					var h=mytimestamp_sysdiff.getHours(),
					    m=mytimestamp_sysdiff.getMinutes(),
					    s=mytimestamp_sysdiff.getSeconds(),
					    ms=mytimestamp_sysdiff.getMilliseconds(),
					    dy=mytimestamp_sysdiff.getDay(),
					    dt=mytimestamp_sysdiff.getDate(),
					    mo=mytimestamp_sysdiff.getMonth(),
					    y=mytimestamp_sysdiff.getFullYear(),
					    ap="AM",
					    calend="";
					if (h > 11) { ap = "PM"; }
					var H12 = h;
					if (H12 > 12) { H12 = H12 - 12; }
					else if (H12 === 0) { H12 = 12; }

					if(myoptions.calendar === true) {

						/* Format Date String according to PHP style Format Characters http://php.net/manual/en/function.date.php */
						var dateStr = "";
						for(var n = 0; n <= myoptions.dateFormat.length; n++) {
							var chr = myoptions.dateFormat.charAt(n);
							switch(chr){
								//DAY
								case "d": //Day of the Month, 2 digits with leading zeros
								  dateStr += (''+dt).padStart(2,"0");
								  break;
								case "D": //A textual representation of a day, three letters 
								  dateStr += new Intl.DateTimeFormat(myoptions.langSet, {weekday: 'short'}).format(mytimestamp_sysdiff);
								  break;
								case "j": //Day of the month without leading zeros
								  dateStr += dt;
								  break;
								case "l": //A full textual representation of the day of the week
								  dateStr += new Intl.DateTimeFormat(myoptions.langSet, {weekday: 'long'}).format(mytimestamp_sysdiff);
								  break;
								case "N": // ISO-8601 numeric representation of the day of the week (1-7)
								  dateStr += (dy+1);
								  break;
								/*case "S": //English ordinal suffix for the day of the month, 2 characters
								  dateStr += suffix... st, nd, rd, th...
								  break;*/
								case "w": //Numeric representation of the day of the week (0-6)
								  dateStr += dy;
								  break;
								/*case "z": //The day of the year (starting from 0)
								  dateStr += 0-365...
								  break; */
								
								//WEEK
								/*case "W": // ISO-8601 week number of year, weeks starting on Monday
								  dateStr += weeknumber...//Example 42, 42nd week of the year
								  break; */
									
								//MONTH
								case "F": //A full textual representation of a month, such as January or March
								  dateStr += new Intl.DateTimeFormat(myoptions.langSet, {month: 'long'}).format(mytimestamp_sysdiff);
								  break;
								case "m": //Numeric representation of a month, with leading zeros
								  dateStr += ((mo+1)+'').padStart(2,"0");
								  break;
								case "M": //A short textual representation of a month, three letters
								  dateStr += new Intl.DateTimeFormat(myoptions.langSet, {month: 'short'}).format(mytimestamp_sysdiff);
								  break;
								case "n": //Numeric representation of a month, without leading zeros
								  dateStr += (mo+1);
								  break;
								/*case "t": //Number of days in the given month
								  dateStr += 
								  break;*/
								
								//YEAR
								/*case "L": // Whether it's a leap year
								  dateStr += //1 if it is a leap year, 0 otherwise
								  break;*/
								/*case "o": //ISO-8601 week-numbering year. This has the same value as Y, except that if the ISO week number (W) belongs to the previous or next year, that year is used instead
								  dateStr += ...
								  break;*/
								case "Y": //A full numeric representation of a year, 4 digits
								  dateStr += y;
								  break;
								case "y": //A two digit representation of a year
								  dateStr += y.toString().substr(2,2);
								  break;
								default:
								  dateStr += chr;
							}
						}
						calend = '<span class="clockdate">'+dateStr+'</span>';
					}

					/* Prepare Time String using PHP style Format Characters http://php.net/manual/en/function.date.php */
					var timeStr = "";
					for(var n = 0; n <= myoptions.timeFormat.length; n++) {
						var chr = myoptions.timeFormat.charAt(n);
						switch(chr){
							case "a": //Lowercase Ante meridiem and Post meridiem
							  timeStr += ap.toLowerCase();
							  break;
							case "A": //Uppercase Ante meridiem and Post meridiem
							  timeStr += ap;
							  break;
							/*case "B": //Swatch Internet time
							  timeStr += //000 through 999
							  break;*/
							case "g": //12-hour format of an hour without leading zeros
							  timeStr += H12;
							  break;
							case "G": //24-hour format of an hour without leading zeros
							  timeStr += h;
							  break;
							case "h": //12-hour format of an hour with leading zeros
							  timeStr += (''+H12).padStart(2,"0");
							  break;
							case "H": //24-hour format of an hour with leading zeros
							  timeStr += (''+h).padStart(2,"0");
							  break;
							case "i": //Minutes with leading zeros
							  timeStr += (''+m).padStart(2,"0");
							  break;
							case "s": //Seconds, with leading zeros
							  timeStr += (''+s).padStart(2,"0");
							  break;
							/*case "u": //Microseconds
							  timeStr += microseconds...
							  break; */
							case "v": //Milliseconds
							  timeStr += ms.padStart(3,"0");
							  break;
								
							//TIMEZONE
							case "e": //Timezone identifier 
							  timeStr += myoptions.timezone;
							  break;
							case "I": //Whether or not the date is in daylight saving time
							  timeStr += (myoptions.isDST ? "DST" : "");
							  break;
							/*case "O": //Difference to Greenwich time (GMT) in hours
							  timeStr += //Example +0200
							  break;*/
							/*case "P": //Difference to Greenwich time (GMT) with colon between hours and minutes
							  timeStr += //Example +02:00
							  break;*/
							/*case "T": //Timezone abbreviation
							  timeStr += timezone_abbrev...
							  break;*/
							/*case "Z": //Timezone offset in seconds. The offset for timezones west of UTC is always negative, and for those east of UTC is always positive.
							  dateStr += timezone_offset_secs...
							  break;*/
							
							//FULL DATE/TIME
							/*case "c": // ISO 8601 date 
							  timeStr += //Example 2004-02-12T15:19:21+00:00
							  break;*/
							/*case "r": //» RFC 2822 formatted date
							  timeStr += //Example: Thu, 21 Dec 2000 16:01:07 +0200
							  break;*/
							/*case "U": //Seconds since the Unix Epoch
							  timeStr += unix_epoch_secs...
							  break;*/
							default:
							  timeStr += chr;
						}
					}

					$(el).html(calend+"<span class='clocktime'>"+timeStr+"</span>");
					jqClock[el_id] = setTimeout(function() { updateClock( $(el), myoptions ); }, 1000);
				}

			}

			if ( !$(this).hasClass("jqclock")){ $(this).addClass("jqclock"); }
			if ( !$(this).is("[id]") ){ $(this).attr("id", newGuid()); }

			updateClock($(this),options);
		});
	}

	return this;

})(jQuery);
