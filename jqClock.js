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
if(!Date.prototype.hasOwnProperty("isLeapYear")){
	//source: https://stackoverflow.com/a/26426761/394921
	Date.prototype.isLeapYear = function() {
	    var year = this.getFullYear();
	    if((year & 3) != 0) return false;
	    return ((year % 100) != 0 || (year % 400) == 0);
	};
}
if(!Date.prototype.hasOwnProperty("getDOY")){
	// Get Day of Year
	//source: https://stackoverflow.com/a/26426761/394921
	//maybe can use the solution [here](https://stackoverflow.com/a/28919172/394921) also: Math.round((new Date().setHours(23) - new Date(new Date().getYear()+1900, 0, 1, 0, 0, 0))/1000/60/60/24);
	Date.prototype.getDOY = function() {
		var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
		var mn = this.getMonth();
		var dn = this.getDate();
		var dayOfYear = dayCount[mn] + dn;
		if(mn > 1 && this.isLeapYear()) dayOfYear++;
		return dayOfYear;
	};
}
if(!Date.prototype.hasOwnProperty("daysInMonth")){
	//Get number of days in the current month
	//source: https://stackoverflow.com/questions/1184334/get-number-days-in-a-specified-month-using-javascript#comment36681053_1464716
	Date.prototype.daysInMonth = function(){
		return [31, (this.isLeapYear() ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][this.getMonth()];
	};
}
if(!Date.prototype.hasOwnProperty("getWOY")){
	//Get Week Number in the Year
   	//source: https://stackoverflow.com/a/6117889/394921
	Date.prototype.getWOY = function(getY) {
		var d = new Date(+this);
		d.setHours(0, 0, 0, 0);
		d.setDate(d.getDate() + 4 - (d.getDay() || 7));
		if(getY){ return d.getFullYear(); }
		else { return Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7); }
	};
}
if(!Date.prototype.hasOwnProperty("swatchTime")){
   	//Get Swatch Internet Time
   	//source: https://gist.github.com/rev22/8085260
	Date.prototype.swatchTime = function(){
		return ("00"+Math.floor((((this.getUTCHours()+1)%24*60+this.getUTCMinutes())*60+this.getUTCSeconds()+(this.getUTCMilliseconds()*0.001))/86.4)).slice(-3);		
	}
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

//Let's implement a Number.map function
//source:https://stackoverflow.com/questions/10756313/javascript-jquery-map-a-range-of-numbers-to-another-range-of-numbers#comment40722057_23202637
if (!Number.prototype.map) {
	Number.prototype.map=function(a,b,c,d){return c+(d-c)*((this-a)/(b-a));};
}
//END NUMBER.PROTOTYPE.MAP

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

	$.clock = {
		"version": "2.3.5",
		"options": [
			{
				"type":		"string",
				"value": 	"destroy",
				"description":	"Passing in 'destroy' to an already initialized clock will remove the setTimeout for that clock to stop it from ticking, and remove all html markup and data associated with the plugin instance on the dom elements"
			},
			{
				"type":		"string",
				"value": 	"stop",
				"description":	"Passing in 'stop' to an already initialized clock will clear the setTimeout for that clock to stop it from ticking"
			},
			{
				"type":		"string",
				"value": 	"start",
				"description":	"Passing in 'start' to an already initialized clock will restart the setTimeout for that clock to get it ticking again, as though it had never lost time"
			},
			{	"type":		"object",
			 	"description":	"option set {}",
			 	"values":	[
						{
							"name":		"timestamp",
							"description":	"Either a javascript timestamp as produces by [JAVASCRIPT new Date().getTime()] or a php timestamp as produced by [PHP time()] ",
							"type":		"unix timestamp",
							"values":	["javascript timestamp", "php timestamp"]
						},
						{
							"name":		"langSet",
							"description":	"two letter locale to be used for the translation of Day names and Month names",
							"type":		"String",
							"values":	["am", "ar", "bn", "bg", "ca", "zh", "hr", "cs", "da", "nl", "en", "et", "fi", "fr", "de", "el", "gu", "hi", "hu", "id", "it", "ja", "kn", "ko", "lv", "lt", "ms", "ml", "mr", "mo", "ps", "fa", "pl", "pt", "ro", "ru", "sr", "sk", "sl", "es", "sw", "sv", "ta", "te", "th", "tr", "uk", "vi"]
						},
						{
							"name":		"calendar",
							"description":	"Whether the date should be displayed together with the time",
							"type":		"Boolean",
							"values":	[true,false]
						},
						{
							"name":		"dateFormat",
							"description":	"PHP Style Format string for formatting a local date, see http://php.net/manual/en/function.date.php",
							"type":		"String",
							"values":	["d","D","j","l","N","S","w","z","W","F","m","M","n","t","L","o","Y","y"]
						},
						{
							"name":		"timeFormat",
							"description":	"PHP Style Format string for formatting a local date, see http://php.net/manual/en/function.date.php",
							"type":		"String",
							"values":	["a","A","B","g","G","h","H","i","s","v","e","I","O","P","Z","c","r","U"]
						},
						{
							"name":		"isDST",
							"description":	"When a client side timestamp is used, whether DST is active will be automatically determined. However this cannot be determined for a server-side timestamp which must be passed in as UTC, in that can case it can be set with this option",
							"type":		"Boolean",
							"values":	[true,false]
						},
						{
							"name":		"rate",
							"description":	"Defines the rate at which the clock will update, in milliseconds",
							"type":		"Integer",
							"values":	"1 - 9007199254740991 (recommended 10-60000)"
						}
						]
			}
		],
		"methods": {
			"destroy":	"Chaining clock().destroy() has the same effect as passing the 'destroy' option as in clock('destroy')",
			"stop":		"Chaining clock().stop() has the same effect as passing the 'stop' option as in clock('stop')",
			"start":	"Chaining clock().start() has the same effect as passing the 'start' option as in clock('start')"
		}
	};
	Object.freeze($.clock);
	
	//_jqClock contains references to each clock's settimeouts
	var _jqClock = _jqClock || {};
	
	$.fn.clock = function(options) {
		var _this = this;

		this.initialize = function(){
			return this;
		}
		
		this.destroy = function(){
			return _this.each(function(idx){
				var el_id = $(this).attr("id");
				if(_jqClock.hasOwnProperty(el_id)){ 
					clearTimeout(_jqClock[el_id]); 
					delete _jqClock[el_id];
				}
				$(this).html("");
				if ( $(this).hasClass("jqclock")){ $(this).removeClass("jqclock"); }
				$(this).removeData("clockoptions");
			});
		}

		this.stop = function(){
			return _this.each(function(idx){
				var el_id = $(this).attr("id");
				if(_jqClock.hasOwnProperty(el_id)){ 
					clearTimeout(_jqClock[el_id]); 
					delete _jqClock[el_id];
				}
			});
		}

		this.start = function(){
			return _this.each(function(idx){
				var el_id = $(this).attr("id");
				var current_options = $(this).data("clockoptions");
				if(current_options !== undefined && _jqClock.hasOwnProperty(el_id) === false){ 
					var __this = this;
					_jqClock[el_id] = setTimeout(function() { _updateClock( $(__this) ); }, current_options.rate); 
				}
			});
		}
		
		/* Define some helper functions */
		var _newGuid = function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
				function(c) {
					var r = Math.random() * 16 | 0,
					    v = c == 'x' ? r : (r & 0x3 | 0x8);
					return v.toString(16);
				}).toUpperCase();
		},
		_ordSuffix = function(ord) {
			var ord_suffix = ''; //st, nd, rd, th
			if(ord===1 || (ord % 10 === 1  && ord != 11) ){ ord_suffix = 'st'; }
			else if( ord===2 || (ord % 10 === 2  && ord != 12) ){ ord_suffix = 'nd'; }
			else if( ord===3 || (ord % 10 === 3  && ord != 13) ){ ord_suffix = 'rd'; }
			else { ord_suffix = 'th'; }
			return ord_suffix;
		},
		_updateClock = function(el) {      
			var myoptions = $(el).data("clockoptions");

			//since system time and timezones affect the Date object, let's make sure it's not going to affect our clock:
			var currentTzOffset = new Date().getTimezoneOffset();
			var correction = (currentTzOffset === myoptions.tzOffset) ? 0 : (currentTzOffset - myoptions.tzOffset)*60*1000;
			
			var pfnow = performance.now();
			//get our new timestamp with all the timezone offsets and corrections !!!
			//corrected and re-corrected !!!
			var mytimestamp = performance.timing.navigationStart + pfnow + myoptions.sysdiff + correction;
			
			var mytimestamp_sysdiff = new Date(mytimestamp);
			var h=mytimestamp_sysdiff.getHours(),
			    m=mytimestamp_sysdiff.getMinutes(),
			    s=mytimestamp_sysdiff.getSeconds(),
			    ms=mytimestamp_sysdiff.getMilliseconds(),
			    us=(''+(pfnow % 1)).substring(2,5),
			    dy=mytimestamp_sysdiff.getDay(),
			    dt=mytimestamp_sysdiff.getDate(),
			    mo=mytimestamp_sysdiff.getMonth(),
			    y=mytimestamp_sysdiff.getFullYear(),
			    ly=mytimestamp_sysdiff.isLeapYear(),
			    doy=mytimestamp_sysdiff.getDOY(),
			    woy=mytimestamp_sysdiff.getWOY(),
			    iso8601Year=mytimestamp_sysdiff.getWOY(true),
			    dim=mytimestamp_sysdiff.daysInMonth(),
			    swt=mytimestamp_sysdiff.swatchTime(),
			    tzH=parseInt(myoptions.tzOffset / 60),
			    tzS=parseInt(myoptions.tzOffset * 60),
			    ap="AM",
			    calendElem="",
			    clockElem="";
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
						case "N": // ISO-8601 numeric representation of the day of the week (1-7, 1=Monday)
						  dateStr += (dy===0?7:dy);
						  break;
						case "S": //English ordinal suffix for the day of the month, 2 characters
						  dateStr += _ordSuffix(dt);
						  break;
						case "w": //Numeric representation of the day of the week (0-6, 0=Sunday)
						  dateStr += dy;
						  break;
						case "z": //The day of the year (starting from 0)
						  dateStr += (doy-1);
						  break;

						//WEEK
						case "W": // ISO-8601 week number of year, weeks starting on Monday
						  dateStr += woy;
						  break;

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
						case "t": //Number of days in the given month
						  dateStr += dim;
						  break;

						//YEAR
						case "L": // Whether it's a leap year
						  dateStr += (ly?1:0); //1 if it is a leap year, 0 otherwise
						  break;
						case "o": //ISO-8601 week-numbering year. This has the same value as Y, except that if the ISO week number (W) belongs to the previous or next year, that year is used instead
						  dateStr += iso8601Year;
						  break;
						case "Y": //A full numeric representation of a year, 4 digits
						  dateStr += y;
						  break;
						case "y": //A two digit representation of a year
						  dateStr += y.toString().substr(2,2);
						  break;
						case String.fromCharCode(92): //backslash character, which would have to be a double backslash in the original string!!!
						  dateStr += myoptions.dateFormat.charAt(++n);
						  break;
						case "%":
						  var pos=n+1;
						  var str=myoptions.dateFormat;
						  while(pos<str.length){
						    if(str.charAt(pos)=="%"){
						      break;
						    }
						    pos++;
						  }
						  if(pos>n+1 && pos != str.length){
						    dateStr += str.substring(n+1,pos);
						    n+=(pos-n);
						  }
						  else{ dateStr += chr; }
						  break;
						default:
						  dateStr += chr;
					}
				}
				calendElem = '<span class="clockdate">'+dateStr+'</span>';
			}

			/* Prepare Time String using PHP style Format Characters http://php.net/manual/en/function.date.php */
			var timeStr = "";
			for(var nn = 0; nn <= myoptions.timeFormat.length; nn++) {
				var chrr = myoptions.timeFormat.charAt(nn);
				switch(chrr){
					case "a": //Lowercase Ante meridiem and Post meridiem
					  timeStr += ap.toLowerCase();
					  break;
					case "A": //Uppercase Ante meridiem and Post meridiem
					  timeStr += ap;
					  break;
					case "B": //Swatch Internet time
					  timeStr += swt;//000 through 999
					  break;
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
					case "u": //Microseconds
					  timeStr += (''+ms).padStart(3,"0") + (''+us).padStart(3,"0");
					  break;
					case "v": //Milliseconds
					  timeStr += (''+ms).padStart(3,"0");
					  break;

					//TIMEZONE
					case "e": //Timezone identifier 
					  timeStr += myoptions.timezone;
					  break;
					case "I": //Whether or not the date is in daylight saving time
					  timeStr += (myoptions.isDST ? "DST" : "");
					  break;
					case "O": //Difference to Greenwich time (GMT) in hours
					  timeStr += (tzH<0 ? '+'+(''+Math.abs(tzH)).padStart(2,"0") : ( tzH>0 ? (''+(tzH * -1)).padStart(2,"0") : "+00" ) )+"00";
					  break;
					case "P": //Difference to Greenwich time (GMT) with colon between hours and minutes
					  timeStr += (tzH<0 ? '+'+(''+Math.abs(tzH)).padStart(2,"0") : ( tzH>0 ? (''+(tzH * -1)).padStart(2,"0") : "+00" ) )+":00";
					  break;
					/*case "T": //Timezone abbreviation
					  timeStr += timezone_abbrev...
					  break;*/
					case "Z": //Timezone offset in seconds. The offset for timezones west of UTC is always negative, and for those east of UTC is always positive.
					  timeStr += (tzS<0 ? ''+Math.abs(tzS) : (tzS>0 ? ''+(tzS*-1) : "0" ) );
					  break;

					//FULL DATE/TIME
					case "c": // ISO 8601 date | Example 2004-02-12T15:19:21+00:00
					  timeStr += y+'-'+((mo+1)+'').padStart(2,"0")+'-'+(''+dt).padStart(2,"0")+'T'+(''+h).padStart(2,"0")+':'+(''+m).padStart(2,"0")+':'+(''+s).padStart(2,"0")+(tzH<0 ? '+'+(''+Math.abs(tzH)).padStart(2,"0") : ( tzh>0 ? (''+(tzh * -1)).padStart(2,"0") : "+00" ) )+":00";
					  break;
					case "r": //» RFC 2822 formatted date | Example: Thu, 21 Dec 2000 16:01:07 +0200
					  timeStr +=  new Intl.DateTimeFormat(myoptions.langSet, {weekday: 'short'}).format(mytimestamp_sysdiff) + ', ' + dt + ' ' + new Intl.DateTimeFormat(myoptions.langSet, {month: 'short'}).format(mytimestamp_sysdiff) + ' ' + y + ' '+(''+h).padStart(2,"0")+':'+(''+m).padStart(2,"0")+':'+(''+s).padStart(2,"0")+' '+(tzH<0 ? '+'+(''+Math.abs(tzH)).padStart(2,"0") : ( tzh>0 ? (''+(tzh * -1)).padStart(2,"0") : "+00" ) )+"00";
					  break;
					case "U": //Seconds since the Unix Epoch
					  timeStr += Math.floor(mytimestamp / 1000);
					  break;
					case String.fromCharCode(92): //backslash character, which would have to be a double backslash in the original string!!!
					  timeStr += myoptions.timeFormat.charAt(++nn);
					  break;
					case "%":
					  var poss=nn+1;
					  var strr=myoptions.timeFormat;
					  while(poss<strr.length){
					    if(strr.charAt(poss)=="%"){
					      break;
					    }
					    poss++;
					  }
					  if(poss>nn+1 && poss != strr.length){
					    timeStr += strr.substring(nn+1,poss);
					    nn+=(poss-nn);
					  }
					  else{ timeStr += chrr; }
					  break;
					default:
					  timeStr += chrr;
				}
			}
			clockElem = '<span class="clocktime">'+timeStr+'</span>';

			$(el).html(calendElem+clockElem);					
			var el_id = $(el).attr("id");
			_jqClock[el_id] = setTimeout(function() { _updateClock( $(el) ); }, myoptions.rate);

		};

		this.each(function(idx){
			if(typeof options === 'undefined' || typeof options === 'object'){
				
				//this is useful only for client timestamps... 
				//used immediately for the default value of options.isDST...
				var highPrecisionTimestamp = performance.timing.navigationStart + performance.now();
				var sysDateObj = new Date(highPrecisionTimestamp);
				//TODO: if server timestamp is passed in and options.isDST is not, then options.isDST isn't any good...
				//       no use using a client timestamps check for DST when a server timestamp is passed!

				options = options || {};

				/* User passable options: make sure we have default values if user doesn't pass them! */
				/* I prefer this method to jQuery.extend because we can dynamically set each option based on a preceding option's value */
				options.timestamp	= options.timestamp	|| "localsystime";
				options.langSet		= options.langSet	|| "en";
				options.calendar	= options.hasOwnProperty("calendar") ? options.calendar	: true;
				options.dateFormat	= options.dateFormat	|| ((options.langSet=="en") ? "l, F j, Y" : "l, j F Y");
				options.timeFormat	= options.timeFormat	|| ((options.langSet=="en") ? "h:i:s A" : "H:i:s");
				options.timezone	= options.timezone	|| "localsystimezone"; //should only really be passed in when a server timestamp is passed
				options.isDST		= options.hasOwnProperty("isDST") ? options.isDST : sysDateObj.isDST(); //should only really be passed in when a server timestamp is passed
				options.rate		= options.rate		|| 500; //500ms makes for a more faithful clock than 1000ms, less skewing

				//ensure we have correct value types
				if(typeof(options.langSet) !== 'string'){
					options.langSet = (''+options.langSet);
				}
				if(typeof(options.calendar) === 'string'){
					options.calendar = Boolean(options.calendar == 'false' ? false : true);
				}
				else if(typeof(options.calendar) !== 'boolean'){
					options.calendar = Boolean(options.calendar); //do our best to get a boolean value
				}
				if(typeof(options.dateFormat) !== 'string'){
					options.dateFormat = (''+options.dateFormat);
				}
				if(typeof(options.timeFormat) !== 'string'){
					options.timeFormat = (''+options.dateFormat);
				}
				if(typeof(options.timezone) !== 'string'){
					options.timezone = (''+options.timezone);
				}
				if(typeof(options.isDST) === 'string'){
					options.isDST = Boolean(options.isDST == 'true' ? true : false);
				}
				else if(typeof(options.isDST) !== 'boolean'){
					options.isDST = Boolean(options.isDST);
				}
				if(typeof(options.rate)  !== 'number'){
					options.rate = parseInt(options.rate); //do our best to get an int value
				}

				/*****************************|
				|* Non user passable options *|
				|*****************************/
				//getTimezoneOffset gives minutes
				options.tzOffset = sysDateObj.getTimezoneOffset();
				
				//divide by 60 to get hours from minutes
				var tzOffset = options.tzOffset / 60;
				
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
				if( options.timestamp != "localsystime" ){      
					
					//LET'S TRY TO FIGURE OUT WHETHER WE ARE DEALING WITH A JAVASCRIPT TIMESTAMP
					//OR WITH A PHP TIMESTAMP
					var digitCountDiff = (sysDateObj.getTime()+'').length - (options.timestamp+'').length;
					
					//IF THERE ARE MORE THAN TWO DIGITS DIFFERENCE FROM A JAVASCRIPT TIMESTAMP, 
					//THEN IT'S A PHP TIMESTAMP
					if(digitCountDiff > 2){
						options.timestamp = options.timestamp * 1000;
						options.sysdiff = (options.timestamp - sysDateObj.getTime()) + (options.tzOffset*60*1000);
						//options.timezone has most probably been set in this case
					}
					//OTHERWISE IT'S SIMPLY A CUSTOM JAVASCRIPT TIMESTAMP
					else{
						options.sysdiff = options.timestamp - sysDateObj.getTime();
						/* ARE THE NEXT FEW LINES AT ALL USEFUL??? */
						//options.timezone has most probably not been set, let's do some guesswork
						if(options.timezone == "localsystimezone"){
							options.timezone = 'UTC';
							var rmn = tzOffset % 1;
							tzOffset = tzOffset - rmn;
							var suffix = '';
							if(Math.abs(rmn) !== 0){
								suffix = ''+Math.abs(rmn).map(0,1,0,60);
							}
							if(tzOffset < 0){ options.timezone += ('+' + Math.abs(tzOffset))+(suffix!==''?':'+suffix:''); }
							else if(tzOffset > 0){ options.timezone += (tzOffset * -1)+(suffix!==''?':'+suffix:''); }
						}
						/* MIGHT WANT TO DOUBLE CHECK IF THE PRECEDING LOGIC IS AT ALL USEFUL... */
					}
				}
				
				//OTHERWISE IF NO TIMESTAMP HAS BEEN PASSED IN
				else{
					//options.timezone has most probably not been set, let's do some guesswork
					if(options.timezone == "localsystimezone"){
						options.timezone = 'UTC';
						var rmn1 = tzOffset % 1;
						tzOffset = tzOffset - rmn1;
						var suffix1 = '';
						if(Math.abs(rmn1) !== 0){
							suffix1 = ''+Math.abs(rmn1).map(0,1,0,60);
						}
						if(tzOffset < 0){ options.timezone += ('+' + Math.abs(tzOffset))+(suffix1!==''?':'+suffix1:''); }
						else if(tzOffset > 0){ options.timezone += (tzOffset * -1)+(suffix1!==''?':'+suffix1:''); }
					}
				}
				/*********************************|
				|* END Non user passable options *|
				|*********************************/
				
				if ( !$(this).hasClass("jqclock")){ $(this).addClass("jqclock"); }
				if ( !$(this).is("[id]") ){ $(this).attr("id", _newGuid()); }
				$(this).data("clockoptions",options);
				//only allow one associated settimeout at a time! basically, only one plugin instance per dom element
				if(_jqClock.hasOwnProperty($(this).attr("id")) === false){ _updateClock($(this)); }
			}
			else if(typeof options === 'string'){
				var el_id = $(this).attr("id");
				switch(options){
					case 'destroy':
						if(_jqClock.hasOwnProperty(el_id)){ 
							clearTimeout(_jqClock[el_id]); 
							delete _jqClock[el_id];
						}
						$(this).html("");
						if ( $(this).hasClass("jqclock")){ $(this).removeClass("jqclock"); }
						$(this).removeData("clockoptions");
						break;
					case 'stop':
						if(_jqClock.hasOwnProperty(el_id)){ 
							clearTimeout(_jqClock[el_id]); 
							delete _jqClock[el_id];
						}
						break;
					case 'start':
						var __this = this;
						var current_options = $(this).data("clockoptions");
						if(current_options !== undefined && _jqClock.hasOwnProperty(el_id) === false){ _jqClock[el_id] = setTimeout(function() { _updateClock( $(__this) ); }, current_options.rate); }
						break;
				}
			}
		});
		
		return this.initialize();
	}

	return this;

})(jQuery);
