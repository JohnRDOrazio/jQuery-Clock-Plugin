Turns a given dom element into a dynamic clock that updates every second, main advantage compared to other similar plugins is that this one can also take an initial timestamp instead of client system time.

# DEMOS

## Client Timestamp Live examples

See a client side demo in action here at github: **http://lwangaman.github.io/jQuery-Clock-Plugin/**
You can see a demo that you can edit and play around with yourself at **http://jsbin.com/maqegib/edit?html,css,js,output**.
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
$("div#clock").clock({"calendar":"false"});
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
| *Month*           | ---                                        | ---                 |
| *F* | A full textual representation of a month, such as January or March | *January* through *December* |
| *m* | Numeric representation of a month, with leading zeros    | *01* through *12*   |
| *M* | A short textual representation of a month, three letters | *Jan* through *Dec* |
| *n* | Numeric representation of a month, without leading zeros | *1* through *12*    |
| *Year*            | ---                                        | ---                 |
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
| *g* | 12-hour format of an hour without leading zeros          | *1* through *12*  |
| *G* | 24-hour format of an hour without leading zeros          | *0* through *23*  |
| *h* | 12-hour format of an hour with leading zeros             | *01* through *12* |
| *H* | 24-hour format of an hour with leading zeros             | *00* through *23* |
| *i* | Minutes with leading zeros                               | *00* to *59*      |
| *s* | Seconds with leading zeros                               | *00* to *59*      |
| *e* | Timezone identifier                                      | *UTC*, *UTC+1*    |
| *I* (capital i) | Whether the date is in daylight saving time  | *DST* if Daylight Savings Time, otherwise nothing  |

**Example:**
```JavaScript
$("div#clock").clock({"timeFormat":"h:i:s A e I"});
```

## Language options

Includes 6 language translations for days of the week and months of the year: English, French, Spanish, Italian, German, Russian. 
```JavaScript
$("div#clock").clock({"langSet":"de"});
```

The language translations can be easily extended. To add Portuguese language:
```JavaScript
$.clock.locale.pt = {
  "weekdays":["Domingo","Segunda-feira", "Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira", "Sábado"],
  "shortWeekdays":["Dom","Seg","Ter","Quar","Quin","Sext"],
  "months":["Janeiro","Fevereiro","Março","Abril", "Maio","Junho","Julho","Agosto","Setembro","October","Novembro", "Dezembro"],
  "shortMonths":["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Oct","Nov","Dez"] 
};
```

You can then set a clock to use this language set:
```JavaScript
$("div#clock").clock({"langSet":"pt"});
```

## Custom client generated timestamp

You can pass in a custom javascript timestamp:
```JavaScript
var customDateObj = new Date();
var customtimestamp = customDateObj.getTime();
customtimestamp = customtimestamp+1123200000+10800000+14000; // sets the time 13 days, 3 hours and 14 seconds ahead
$("#clock").clock({"timestamp":customtimestamp});
```

See an example of this in action here: **http://jsbin.com/maqegib/edit?html,css,js,output**

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
***In the latest version of the jQuery Clock plugin it is no longer necessary to compensate a server generated timestamp for the missing milliseconds by multiplying the value by 1000 before passing it into the plugin; this will be taken care of by the plugin itself, actually now it's important not to do so because the plugin will detect whether to compensate for local timezone offset or not depending on whether the timestamp is server generated or client generated.***
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

## Destroy handler

Includes a handler so that each clock can be stopped, just pass "destroy".
```JavaScript
$("div#clock").clock("destroy");
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

## [v2.0.2](https://github.com/Lwangaman/jQuery-Clock-Plugin/releases/tag/v2.0.2 "https://github.com/Lwangaman/jQuery-Clock-Plugin/releases/tag/v2.0.2")

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


## [v2.0.9b](https://github.com/Lwangaman/jQuery-Clock-Plugin/releases/tag/v2.0.9b "https://github.com/Lwangaman/jQuery-Clock-Plugin/releases/tag/v2.0.9b")

Version 2.0.9 fixes the problems which arise from the timezone offsets. In order to faithfully reflect the server's timestamp in UTC time, the plugin corrects the client timezone offset so that the jQuery Clock's time will reflect UTC time. 
However if the server has set a timezone offset from UTC time, this will need to be accounted for server-side *before* passing the timestamp to the plugin.

Seeing that this process only needs to take place when a server-generated timestamp is being passed in, this version of the plugin detects if the timestamp is server-generated by checking whether it takes into account milliseconds or not. *This means we no longer multiply the server-generated timestamp by 1000 before passing it to the plugin.* In fact the plugin will use that information to determine whether the timestamp was server-generated so that it can then account for client timezone offsets.

The tag was renamed 2.0.9b because I forgot to update the minified version the first time; 2.0.9b has an updated minified javascript file.


## [v2.1.0b](https://github.com/Lwangaman/jQuery-Clock-Plugin/releases/tag/v2.1.0b "https://github.com/Lwangaman/jQuery-Clock-Plugin/releases/tag/v2.1.0b")

Version 2.1.0 adds the short version of weekdays and months to the supported locales. Note that the currently supported locales do not guarantee linguistic correctness, the stored values for shortened months and weekdays are guesswork and are not based on any kind of standard usage.

This version also introduces PHP style date and time formatting. This gives the end user more flexibility in choosing how the date and time should appear on the clock. This also means that some option parameters that existed in previous versions have been deprecated, such as the "format" parameter which let the user choose between 12 and 24 hour format, the "seconds" parameter which let the user choose whether to display seconds or not; at the same time more option paramters are added such as "dateFormat" and "timeFormat" (actually the parameter was defined as "hourFormat" in this version!) which recognize a number of PHP style format characters.

Again the tag was renamed 2.1.0b because the javascript was not initially minified.


## [v2.1.2](https://github.com/Lwangaman/jQuery-Clock-Plugin/releases/tag/v2.1.2 "https://github.com/Lwangaman/jQuery-Clock-Plugin/releases/tag/v2.1.2")

This version extends the locales included in the plugin and implements more certain information for shortWeekdays and shortMonths having gathered the information from the ECMA Intl.DateTimeFormat Object.

This bloats the plugin a bit, and may not be useful for all users; this would only be useful for those who need to display a clock in a number of different languages in a dynamic manner.

There are 48 locales included: "am", "ar", "bn", "bg", "ca", "zh", "hr", "cs", "da", "nl", "en", "et", "fi", "fr", "de", "el", "gu", "hi", "hu", "id", "it", "ja", "kn", "ko", "lv", "lt", "ms", "ml", "mr", "mo", "ps", "fa", "pl", "pt", "ro", "ru", "sr", "sk", "sl", "es", "sw", "sv", "ta", "te", "th", "tr", "uk", "vi".

The "timeFormat" parameter is still actually "hourFormat"!

## [v2.1.3](https://github.com/Lwangaman/jQuery-Clock-Plugin/releases/tag/v2.1.3 "https://github.com/Lwangaman/jQuery-Clock-Plugin/releases/tag/v2.1.3")

Extends support for PHP Style Format Characters including the "e" format character which will display the timezone identifier. The timezone offset is calculated for client-side timestamps as "UTC", "UTC+1", "UTC-6"; whereas it will have to be passed in for server generated timestamps by using the "timezone" parameter and passing a string value such as "UTC", "UTC+1" (or "EST", "CET" or even "America\Los Angeles" though it may occupy quite a bit of space in the clock).
With this release the "timeFormat" parameter is finally actually "timeFormat", and not "hourFormat"!
