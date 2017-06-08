Turns a given div element into a dynamic clock that updates every second, main advantage compared to other similar plugins is that this one can also take an initial timestamp instead of client system time.

# DEMOS

You can see a demo that you can edit and play around with yourself at **http://jsbin.com/qoduzacabi/1/edit?html,css,js,output**.
Unfortunately jsbin doesn't allow for server-side coding so it doesn't show the server timestamp example.

If you would like to see a live demo with a server-side example, take a look here: 
**SERVER SIDE CODE EXAMPLE: https://www.johnromanodorazio.com/jQueryClock.php**

# USAGE

Use defaults:
```JavaScript
$("div#clock").clock();
```

## Show or hide specific elements

By default prints the date together with the time, but can be used for time only:
```JavaScript
$("div#clock").clock({"calendar":"false"});
```

By default, output includes seconds, but you can hide the seconds if you prefer:
```JavaScript
$("div#clock").clock({"seconds":"false"});
```

## Language options

Includes 6 language translations for days of the week and months of the year: English, French, Spanish, Italian, German, Russian. 
```JavaScript
$("div#clock").clock({"langSet":"de"});
```

The language translations can be easily extended. To add Portuguese language:
```JavaScript
$.clock.locale.pt = {"weekdays":["Domingo","Segunda-feira", "Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira", "Sábado"],"months":["Janeiro","Fevereiro","Março","Abril", "Maio","Junho","Julho","Agosto","Setembro","October","Novembro", "Dezembro"] };
```
You can then pass in your custom language set:
```JavaScript
$("div#clock").clock({"langSet":"pt"});
```

## Custom client generated timestamp

You can pass in a custom javascript timestamp:
```JavaScript
customtimestamp = new Date();
customtimestamp = customtimestamp.getTime();
customtimestamp = customtimestamp+1123200000+10800000+14000; // sets the time 13 days, 3 hours and 14 seconds ahead
$("#clock").clock({"timestamp":customtimestamp});
```

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
//Get a server side unix timestamp compenating for timezone offset
$time = time() + date('Z');
?>
<input id="servertime" type="hidden" val="<?php echo $time; ?>" />
```
You can then start your clock using that timestamp. 
***In the latest version of the jQuery Clock plugin it is no longer necessary to compensate a server generated timestamp for the missing milliseconds by multiplying the value by 1000 before passing it into the plugin; this will be taken care of by the plugin itself, actually now it's important not to do so because the plugin will detect whether to compensate for local timezone offset or not depending on whether the timestamp is server generated or client generated.***
```JavaScript
/* Please do not do this anymore! */
//servertime = parseInt( $("input#servertime").val() ) * 1000;
/* Just do this: */
servertime = parseInt( $("input#servertime").val() );
$("#clock").clock({"timestamp":servertime});
```

## Custom NTP Timeserver generated timestamp

It is also possible to use a timestamp from an NTP timeserver and start the clock with the ntp's timestamp, in order to have precise atomic time. An example of this can be found here: **https://www.johnromanodorazio.com/ntptest.php**. In the example the ntp timestamp is adjusted on the server to reflect the Europe/London timezone.

## Destroy handler

Includes a handler so that each clock can be stopped, just pass "destroy".
```JavaScript
$("div#clock").clock("destroy");
```
