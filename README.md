[![CodeFactor](https://www.codefactor.io/repository/github/johnrdorazio/jquery-clock-plugin/badge)](https://www.codefactor.io/repository/github/johnrdorazio/jquery-clock-plugin)

Turn a given dom element into a jQuery Clock that can take an initial timestamp (even server generated, or NTP generated) instead of client system time, supports internationalization (48 locales) and PHP Style Format Characters, and is relatively independent from system clock. Supports microsecond time. Can be easily styled with three simple css rules.
Version, options and methods supported can be obtained dynamically through the following three properties of the **$.clock** object:
```JavaScript
$.clock.version; //will return the current version number, so you can be sure which version of the script you are using
$.clock.options; //will return all possible options that can be passed to the jQuery clock plugin, with type description and accepted values
$.clock.methods; //will return all possible methods that are exposed by the plugin
```

# DEMOS

## Client Timestamp Live examples

See a client side demo in action here at github: **https://johnrdorazio.github.io/jQuery-Clock-Plugin/**
You can see a demo that you can edit and play around with yourself at **https://jsbin.com/maqegib/edit?html,css,js,console,output**.
Unfortunately jsbin doesn't allow for server-side coding so it doesn't show the server timestamp example.

## Server Timestamp Live examples

If you would like to see a live demo that uses a server generated timestamp, take a look here: **https://www.johnromanodorazio.com/jQueryClock.php**

## NTP Timestamp Live example

A timestamp generated from an NTP server can also be used. See the example here: **https://www.johnromanodorazio.com/ntptest.php**

# USAGE

Use defaults:
```JavaScript
$("div#clock").clock();
```

## Show or hide calendar

By default prints the date together with the time, but can be used for time only:
```JavaScript
$("div#clock").clock({"calendar":false});
```

## Format Date and Time using PHP style Format Characters

There are two options that allow us to use PHP style Format Characters:
* "dateFormat" -> for formatting the date string
* "timeFormat" -> for formatting the time string

PHP Style Format Characters (such as those found [here](http://php.net/manual/en/function.date.php "PHP Format Characters")) supported by the ***dateFormat*** parameter are:

| Format Character  | Description                                | Example Returned values |
| ----------------- | ------------------------------------------ | ------------------- |
| *Day*             | ---                                        | ---                 |
| *d* | Day of the month, 2 digits with leading zeros            | *01* to *31*        |
| *D* | A textual representation of a day, three letters         | *Mon* through *Sun* |
| *j* | Day of the month without leading zeros                   | *1* to *31*         |
| *l* (lowercase 'L') | A full textual representation of the day of the week | *Sunday* through *Saturday* |
| *N* | ISO-8601 numeric representation of the day of the week   | *1* (for Monday) to *7* (for Sunday) |
| *S* | English ordinal suffix for the day of the month, 2 characters | *st*, *nd*, *rd* or *th*. Works well with *j* |
| *w* | Numeric representation of the day of the week (0-6)      | *0* (for Sunday) to *6* (for Saturday) |
| *z* | The day of the year (starting from 0)                    | *0* to *365*        |
| *Week* | ---                                                   | ---                 |
| *W* | ISO-8601 week number of year, weeks starting on Monday   | Example: *42* (the 42nd week in the year) |
| *Month*           | ---                                        | ---                 |
| *F* | A full textual representation of a month, such as January or March | *January* through *December* |
| *m* | Numeric representation of a month, with leading zeros    | *01* through *12*   |
| *M* | A short textual representation of a month, three letters | *Jan* through *Dec* |
| *n* | Numeric representation of a month, without leading zeros | *1* through *12*    |
| *Year*            | ---                                        | ---                 |
| *L* | Whether it's a leap year                                 | *1* if it is a leap year, *0* otherwise |
| *o* | ISO-8601 week-numbering year. This has the same value as Y, except that if the ISO week number (W) belongs to the previous or next year, that year is used instead                             | Examples: *1999* or *2003* |
| *Y* | A full numeric representation of a year, 4 digits        | Examples: *1999* or *2003* |
| *y* | A two digit representation of a year                     | Examples: *99* or *03* |

**Example:**
```JavaScript
$("div#clock").clock({"dateFormat":"D, F n, Y"});
```

PHP Style Format Characters (such as those found [here](http://php.net/manual/en/function.date.php "PHP Format Characters")) supported by the ***timeFormat*** parameter are:

| Format Character  | Description                                | Example Returned values |
| ----------------- | ------------------------------------------ | ----------------- |
| *Time*            | ---                                        | ---               |
| *a* | Lowercase Ante meridiem and Post meridiem                | *am* or *pm*      |
| *A* | Uppercase Ante meridiem and Post meridiem                | *AM* or *PM*      |
| *B* | Swatch Internet time                                     | *000* through *999*|
| *g* | 12-hour format of an hour without leading zeros          | *1* through *12*  |
| *G* | 24-hour format of an hour without leading zeros          | *0* through *23*  |
| *h* | 12-hour format of an hour with leading zeros             | *01* through *12* |
| *H* | 24-hour format of an hour with leading zeros             | *00* through *23* |
| *i* | Minutes with leading zeros                               | *00* to *59*      |
| *s* | Seconds with leading zeros                               | *00* to *59*      |
| *u* | Microseconds                                             | Example: *654321* |
| *v* | Milliseconds                                             | Example: *654*    |
| *Timezone*         | ---                                       | ---               |
| *e* | Timezone identifier                                      | *UTC*, *UTC+1*    |
| *I* (capital i) | Whether the date is in daylight saving time  | *DST* if Daylight Savings Time, otherwise nothing  |
| *O* | Difference to Greenwich time (GMT) in hours              | Example: *+0200*  |
| *P* | Difference to Greenwich time (GMT) with colon between hours and minutes | Example: *+02:00* |
| *Z* | Timezone offset in Timezone offset in seconds. The offset for timezones west of UTC is always negative, and for those east of UTC is always positive. | *-43200* through *50400* |
| *Full Date/Time*   | ---                                       | ---               |
| *c* | ISO 8601 date                                            | 2004-02-12T15:19:21+00:00 |
| *r* | [» RFC 2822](http://www.faqs.org/rfcs/rfc2822) formatted date | Example: *Thu, 21 Dec 2000 16:01:07 +0200* |
| *U* | Seconds since the Unix Epoch (January 1 1970 00:00:00 GMT) |                 |

**Example:**
```JavaScript
$("div#clock").clock({"timeFormat":"h:i:s A e I"});
```

## Literal sequences in dateFormat or timeFormat
If you would like to output a Format Character as a literal, you can escape it with a double backslash. Double backslashing any character will ensure that it is interpreted literally, even if it's not a Format Character. 

**Example:**
```JavaScript
$("div#clock").clock({"timeFormat":"h:i:s \\A-\\Z"});
```
-> will output "03:50:07 A-Z"

You may wrap any sequence of characters that you wish to be interpreted literally with the '%' character. 

**Example:**
```JavaScript
$("div#clock").clock({"dateFormat":"l, F jS %in the year% Y", "timeFormat":"H:i:s e I %in Swatch Time = %(@B)"});
```
-> will output "Saturday, June 6th in the year 2017" - "03:50:07 UTC+2 DST in Swatch Time = (@118)"

If you would like to output a literal '%' character then you must escape it with a double blackslash. The only limitation is that the desired literal '%' character cannot fall within a literal sequence wrapped with the '%' character. If there is only one '%' character in the whole string then it will be interpreted as a literal.

**Example:**
```JavaScript
//A single '%' character in the whole string will be output as a literal
$("div#clock").clock({"timeFormat":"H:i:s 50%(@B)"});
```
-> will output "03:50:07 50%(@118)" 

**Example:**
```diff
//Please don't do this to get '03:50:07 50% of the time (@118)'
- $("div#clock").clock({"timeFormat":"H:i:s %50% of the time% (@B)"});
//Nor this, it won't work
- $("div#clock").clock({"timeFormat":"H:i:s %50\\% of the time% (@B)"});
//Do this to get '03:50:07 50% of the time (@118)'
+ $("div#clock").clock({"timeFormat":"H:i:s 50\\% %of the time% (@B)"});
```

## Language options

Uses the native ECMA script [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat") object for the translations of the days of the week and months of the year.
Supported locales with the date they were added to the [specification](https://tc39.es/ecma402/#sec-intl-locale-constructor "https://tc39.es/ecma402/#sec-intl-locale-constructor") can be found in the [Unicode BCP 47 specification](https://www.iana.org/assignments/language-subtag-registry "https://www.iana.org/assignments/language-subtag-registry") list.

The desired locale can be set using the "**langSet**" option:

**Example:**
```JavaScript
$("div#clock").clock({"langSet":"de"});
```

## Update Speed

Since v2.1.9 the "**rate**" option has been added so that the rate at which the clock is updated can be set on each clock. The value is in milliseconds. The rate defaults to 500, since at 1000 the clock tends to skew slightly and winds up skipping a second here and there. Instead with an update rate of 500ms the seconds in the clock remain a little more faithful to 1 second increments making for less skewing. When using the "v" Format Character in the "**timeFormat**" option to show milliseconds, bringing the rate down to 50 or 10 or even 1 millisecond (though the page may become processor intensive in this last case) will give a near millisecond faithful clock.

**Example:**
```JavaScript
$("div#clock").clock({"timeFormat":"h:i:s.v","rate":50});
```

## Custom client generated timestamp

You can pass in a custom javascript timestamp:

**Example**
```JavaScript
var customDateObj = new Date();
var customtimestamp = customDateObj.getTime();
customtimestamp = customtimestamp+1123200000+10800000+14000; // sets the time 13 days, 3 hours and 14 seconds ahead
$("#clock").clock({"timestamp":customtimestamp});
```

See an example of this in action here: **https://jsbin.com/maqegib/edit?html,css,js,console,output**

## Custom server generated timestamp

This functionality can be useful to use a **server timestamp** (such as produced by a php script) instead of a client timestamp (such as produced by javascript).
Let's say you use php to set the value of a hidden input field to the server timestamp:
```PHP
<?php
//Get a server side unix timestamp
$time = time();
?>
<input id="servertime" type="hidden" val="<?php echo $time; ?>" />
```
Note however that **if a timezone is set in your PHP interpreter** (either using the *date.timezone = 'America/Los_Angeles'* directive in a php.ini or similar configuration file, or during runtime using *date_default_timezone_set('America/Los_Angeles')* or using *ini_set('date.timezone','America/Los_Angeles')*), then you would have to **compensate for that before feeding the timestamp** to your jQuery Clock. For example you could do this:
```PHP
<?php
//Get a server side unix timestamp compensating for timezone offset
$time = time() + date('Z');
?>
<input id="servertime" type="hidden" val="<?php echo $time; ?>" />
```
You can then start your clock using that timestamp. 
***Since version 2.0.9b it is no longer necessary to compensate a server generated timestamp for the missing milliseconds by multiplying the value by 1000 before passing it into the plugin. This will be taken care of by the plugin itself.***
***Actually it's important not to do so because the plugin will detect whether to compensate for local timezone offset or not depending on whether the timestamp is server generated or client generated.***
```diff
<script type="text/javascript">
/* Please do not do this anymore! */
- //var servertime = parseInt( $("input#servertime").val() ) * 1000;
/* Just do this: */
+ var servertime = parseInt( $("input#servertime").val() );
$("#clock").clock({"timestamp":servertime});
</script>
```

See an example of this in action here: **https://www.johnromanodorazio.com/jQueryClock.php**

## Custom NTP Timeserver generated timestamp

It is also possible to use a timestamp from an NTP timeserver and start the clock with the ntp's timestamp, in order to have precise atomic time. An example of this can be found here: **https://www.johnromanodorazio.com/ntptest.php**. In the example the ntp timestamp is adjusted on the server to reflect the Europe/London timezone.

## Destroy, start and stop handlers

* Includes a handler so that each clock can be destroyed, just pass "destroy". This will effectively remove the html markup, data, and setTimeout which keeps the clock ticking.
```JavaScript
$("div#clock").clock("destroy");
```
* Includes a handler so that each clock can be stopped, just pass "stop". This will remove only the setTimeout which keeps the clock ticking, not the html markup or the data, allowing the clock to start ticking again in a later moment.
```JavaScript
$("div#clock").clock("stop");
```
* Includes a handler so that each clock can be (re-)started, just pass "start". This will insert the setTimeout which keeps the clock ticking. The clock will start up again without having lost time :smiley: !
```JavaScript
$("div#clock").clock("start");
```

## Destroy, start and stop methods

The chainability of the plugin passes an instance of the plugin itself, such that it's public methods can be invoked by the variable that might reference the first instantiation. The plugin includes a destroy(), a start() and a stop() method that are equivalent to the handlers of the same name.
```JavaScript
var $clocks = $("div.clock").clock(); //turn all divs with a "clock" class into jQuery Clocks
$clocks.stop(); //will stop all jQuery Clocks on divs with a "clock" class
$clocks.start(); //will start all jQuery Clocks on divs with a "clock" class
$clocks.first().stop(); //will stop the jQuery Clock on the first div with a "clock" class

$("#bigben").clock().stop(); //will initialize a jQuery Clock on the div with id = "bigben" and stop it in it's tracks...
$("#bigben").clock().start(); //will (re-)start the already initialized jQuery Clock on the div with id = "bigben"
```

## Modifying parameters on initialized jQuery Clocks

All and any parameters can be modified on an already initialized clock. Any modifications will be noticeable on the next tick of the clock.
```JavaScript
var $clocks = $("div.clock").clock(); //turn all divs with a "clock" class into jQuery Clocks
$clocks.first().clock({langSet:"vi"}); //change the locale of the jQuery Clock on the first div with a "clock" class and set it to Vietnamese
$clocks.clock({timeFormat:"H:i:s.v",rate:50}); //change the timeFormat on the jQuery Clocks on all divs with a "clock" class so that they display milliseconds, and update the tick rate of the clocks to 50 milliseconds
```

# Styling

The plugin adds a "jqclock" class to the dom element that the clock is applied to (usually a div). And the internal html structure that is created is like this:
```HTML
<div class="jqclock">
  <span class="clockdate"></span>
  <span class="clocktime"></span>
</div>
```
The clock can be styled accordingly in one's own stylesheet. Some sample styling is included to give an idea:
```CSS
  .jqclock { display:inline-block; text-align:center; border: 1px Black solid; background: LightYellow; padding: 10px; margin:20px; }
  .clockdate { color: DarkRed; margin-bottom: 10px; font-size: 18px; display: block;}
  .clocktime { border: 2px inset White; background: Black; padding: 5px; font-size: 14px; font-family: "Courier"; color: LightGreen; margin: 2px; display: block; }
```

# Releases

Newer releases don't necessarily mean better, it really depends on what you are expecting to get out of this plugin. So here is a quick overview of the releases so you can decide for yourself which version might best suit your needs.

## [v2.3.6](https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.3.6 "https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.3.6")

* `performance.timing.navigationStart` has been deprecrated in favor of `performance.timeOrigin`
* optimize code to avoid redundancies, favor readability, using Codefactor as a reference for code quality
* prefer ES6 style arrow function expressions to traditional functions

## [v2.3.4](https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.3.4 "https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.3.4")

* Becomes relatively independent from the system clock, using Performance.navigation.start + Performance.now() as the fixed reference rather than using System time as the fixed reference. Also corrects for any timezone deviations on the system clock in order to maintain the timezone set on the clock when it was instantiated. So go ahead and play with your system clock and calendar all you want now, it won't affect this jQuery Clock!
* Implements PHP style "u" Format Character for microseconds, which we can now do since we are using Performance.now() which has a 5 microsecond resolution! Not sure if anyone would ever use it or if it can be in any way useful, but hey we do it because we can :wink:

## [v2.3.0](https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.3.0 "https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.3.0")

Returns an instance of the plugin itself along with the dom elements. Adds "start" and "stop" handlers. Adds "destroy()", "start()" and "stop()" methods which have the same effect as the handlers.

## [v2.2.0](https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.2.0 "https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.2.0")

Allows for escaped literals and for literal string sequences wrapped in '%' characters inside the **dateFormat** and **timeFormat** parameters.

## [v2.1.9](https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.1.9 "https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.1.9")

Implements all PHP Style Format Characters except for "T" and "u". Adds a "**rate**" option which allows to customize the rate at which each clock is updated. Bugfix: the month number returned was incorrect in v2.1.6.

## [v2.1.6](https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.1.6 "https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.1.6")

Implements the new Intl.DateTimeFormat object which is now fairly universally supported in ECMA script implementations, completely removing the "locale" parameter from the plugin. It is no longer possible to extend the plugin with customized locales, because the plugin now depends entirely on the native functionality of the Intl.DateTimeFormat object.

## [v2.1.5](https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.1.5 "https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.1.5")

Extends support for PHP Style Format Characters including the "I" (capital i) format character which will display whether the Date is in Daylight Saving Time. For example, "Europe/Paris" would normally be UTC+1 but when DST is active it is actually UTC+2. When displaying both "e" (timezone identifier) and "I" (DST state) for a Date in the "Europe/Paris" timezone, a string like this would be displayed: "UTC+2 DST".

This version also fixes the usage of actual boolean values for those options that use boolean values. Until now it was necessary to pass them in as strings ("true", "false"), now they can be passed in as true booleans (true, false).

In order to have the DST detection functionality, the plugin conditionally extends the Date prototype with two more functions "stdTimezoneOffset" and "isDST" [as found in this stackoverflow answer](https://stackoverflow.com/a/26778394/394921 "https://stackoverflow.com/a/26778394/394921").

## [v2.1.3](https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.1.3 "https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.1.3")

Extends support for PHP Style Format Characters including the "e" format character which will display the timezone identifier. The timezone offset is calculated for client-side timestamps as "UTC", "UTC+1", "UTC-6"; whereas it will have to be passed in for server generated timestamps by using the "timezone" parameter and passing a string value such as "UTC", "UTC+1" (or "EST", "CET" or even "America\Los Angeles" though it may occupy quite a bit of space in the clock).
With this release the "timeFormat" parameter is finally actually "timeFormat", and not "hourFormat"!

## [v2.1.2](https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.1.2 "https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.1.2")

This version extends the locales included in the plugin and implements more certain information for shortWeekdays and shortMonths having gathered the information from the ECMA Intl.DateTimeFormat Object.

This bloats the plugin a bit, and may not be useful for all users; this would only be useful for those who need to display a clock in a number of different languages in a dynamic manner.

There are 48 locales included: "am", "ar", "bn", "bg", "ca", "zh", "hr", "cs", "da", "nl", "en", "et", "fi", "fr", "de", "el", "gu", "hi", "hu", "id", "it", "ja", "kn", "ko", "lv", "lt", "ms", "ml", "mr", "mo", "ps", "fa", "pl", "pt", "ro", "ru", "sr", "sk", "sl", "es", "sw", "sv", "ta", "te", "th", "tr", "uk", "vi".

The "timeFormat" parameter is still actually "hourFormat"!

## [v2.1.0b](https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.1.0b "https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.1.0b")

Version 2.1.0 adds the short version of weekdays and months to the supported locales. Note that the currently supported locales do not guarantee linguistic correctness, the stored values for shortened months and weekdays are guesswork and are not based on any kind of standard usage.

This version also introduces PHP style date and time formatting. This gives the end user more flexibility in choosing how the date and time should appear on the clock. This also means that some option parameters that existed in previous versions have been deprecated, such as the "format" parameter which let the user choose between 12 and 24 hour format, the "seconds" parameter which let the user choose whether to display seconds or not; at the same time more option paramters are added such as "dateFormat" and "timeFormat" (actually the parameter was defined as "hourFormat" in this version!) which recognize a number of PHP style format characters.

Again the tag was renamed 2.1.0b because the javascript was not initially minified.

## [v2.0.9b](https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.0.9b "https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.0.9b")

Version 2.0.9 fixes the problems which arise from the timezone offsets. In order to faithfully reflect the server's timestamp in UTC time, the plugin corrects the client timezone offset so that the jQuery Clock's time will reflect UTC time. 
However if the server has set a timezone offset from UTC time, this will need to be accounted for server-side *before* passing the timestamp to the plugin.

Seeing that this process only needs to take place when a server-generated timestamp is being passed in, this version of the plugin detects if the timestamp is server-generated by checking whether it takes into account milliseconds or not. *This means we no longer multiply the server-generated timestamp by 1000 before passing it to the plugin.* In fact the plugin will use that information to determine whether the timestamp was server-generated so that it can then account for client timezone offsets.

The tag was renamed 2.0.9b because I forgot to update the minified version the first time; 2.0.9b has an updated minified javascript file.

## [v2.0.2](https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.0.2 "https://github.com/JohnRDOrazio/jQuery-Clock-Plugin/releases/tag/v2.0.2")

This captures the state of the first version of the plugin, which allows for dynamically adding one's own locale translations.

The output format of the date and the time are fixed and do not support short weekdays or short months.

Can take a custom timestamp; if the timestamp is server generated it may have to be multiplied by 1000 to account for milliseconds.

This version of the plugin doesn't do anything to account for timezone offsets, which means that the clock's time may not reflect the server's timezone time.

Supported option parameters (possible values in square brackets, default value in bold):

@seconds >> [**"true"**,"false"] *whether to show seconds on the time portion of the clock*

@calendar >> [**"true"**,"false"] *whether to show the date besides showing the time*

@langSet >> [**"en"**,"fr","de","es","it","ru"] *which locale to use to display the date and time.* ***Extendable***

@format >> [**"12"**,"24"] *whether to show the time in 12 hour format or 24 hour format.* ***When the locale is set to english, defaults to "12", but when the locale is set to any other language, defaults to "24"***

@timestamp >> *javascript timestamp with milliseconds; server-generated timestamps which don't account for milliseconds must be multiplied by 1000 in order to be compatible. Defaults to current client time*
