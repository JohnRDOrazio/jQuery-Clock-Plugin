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

//BEGIN JQUERY CLOCK PLUGIN
(function($, undefined) {

	$.clock = {};
	Object.defineProperty($.clock,"version",{
	  value: "2.1.6",
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

			var addleadingzero = function(i){
				if (i<10){i="0" + i;}
				return i;
			},
			newGuid = function() {
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
					    dy=mytimestamp_sysdiff.getDay(),
					    dt=mytimestamp_sysdiff.getDate(),
					    mo=mytimestamp_sysdiff.getMonth()+1,
					    y=mytimestamp_sysdiff.getFullYear(),
					    ap="AM",
					    calend="";
					if (h > 11) { ap = "PM"; }

					if(myoptions.calendar === true) {

						/* Format Date String according to PHP style Format Characters http://php.net/manual/en/function.date.php */
						var dateStr = "";
						for(var n = 0; n <= myoptions.dateFormat.length; n++) {
							var chr = myoptions.dateFormat.charAt(n);
							switch(chr){
								case "d":
								  dateStr += addleadingzero(dt);
								  break;
								case "D":
								  dateStr += new Intl.DateTimeFormat(myoptions.langSet, {weekday: 'short'}).format(mytimestamp_sysdiff);
								  break;
								case "j":
								  dateStr += dt;
								  break;
								case "l":
								  dateStr += new Intl.DateTimeFormat(myoptions.langSet, {weekday: 'long'}).format(mytimestamp_sysdiff);
								  break;
								case "F":
								  dateStr += new Intl.DateTimeFormat(myoptions.langSet, {month: 'long'}).format(mytimestamp_sysdiff);
								  break;
								case "m":
								  dateStr += addleadingzero(mo);
								  break;
								case "M":
								  dateStr += new Intl.DateTimeFormat(myoptions.langSet, {month: 'short'}).format(mytimestamp_sysdiff);
								  break;
								case "n":
								  dateStr += mo;
								  break;
								case "Y":
								  dateStr += y;
								  break;
								case "y":
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
							case "a":
							  timeStr += ap.toLowerCase();
							  break;
							case "A":
							  timeStr += ap;
							  break;
							case "g":
							  if (h > 12) { h = h - 12; }
							  else if (h === 0) { h = 12; }
							  timeStr += h;
							  break;
							case "G":
							  timeStr += h;
							  break;
							case "h":
							  if (h > 12) { h = h - 12; }
							  else if (h === 0) { h = 12; }
							  timeStr += addleadingzero(h);
							  break;
							case "H":
							  timeStr += addleadingzero(h);
							  break;
							case "i":
							  timeStr += addleadingzero(m);
							  break;
							case "s":
							  timeStr += addleadingzero(s);
							  break;
							case "e":
							  timeStr += myoptions.timezone;
							  break;
							case "I":
							  timeStr += (myoptions.isDST ? "DST" : "");
							  break;
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
