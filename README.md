Turns a given div element into a dynamic clock that updates every second, main advantage compared to other similar plugins is that this one can also take an initial timestamp instead of client system time.
You can see a demo that you can edit and play around with yourself at http://jsbin.com/hozure/1/.
Unfortunately jsbin doesn't allow for server-side coding so it doesn't show the server timestamp example.

If you would like to see a live demo with a server-side example, take a look here:

SERVER SIDE CODE EXAMPLE: https://codio.com/Lwangaman/jqClock/tree/index.php

Once you have opened the code example page, the server listener should be activated, and you should now be able to see the code working live at this link: http://pelvis-falser.codio.io:3000/ 

USAGE:

Use defaults:
```JavaScript
$("div#clock").clock();
```

By default prints the date together with the time, but can be used for time only:
```JavaScript
$("div#clock").clock({"calendar":"false"});
```

By default, output includes seconds, but you can hide the seconds if you prefer:
```JavaScript
$("div#clock").clock({"seconds":"false"});
```

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


You can pass in a custom javascript timestamp:
```JavaScript
customtimestamp = new Date();
customtimestamp = customtimestamp.getTime();
customtimestamp = customtimestamp+1123200000+10800000+14000; // sets the time 13 days, 3 hours and 14 seconds ahead
$("#clock").clock({"timestamp":customtimestamp});
```

This functionality can be useful to use a server timestamp (such as produced by a php script) instead of a client timestamp (such as produced by javascript).
Let's say you use php to set the value of a hidden input field to the server timestamp:
```PHP
<?php
echo "<input id='servertime' type='hidden' val='".time()."' />";
?>
```
You can then start your clock using that timestamp. 
Remember however that php timestamps don't include milliseconds, whereas javascript timestamps do, so you must first multiply the value by 1000 before passing it into the plugin (it can also be a good idea to make sure it's a number and not a text value using parseFloat):
```JavaScript
servertime = parseFloat( $("input#servertime").val() ) * 1000;
$("#clock").clock({"timestamp":servertime});
```
It would be interesting to call an ntp timeserver and start clock with ntp's timestamp, in order to have precise time. I have never succeeded in calling an ntp timeserver myself...

Includes a handler to stop the clock, just pass "destroy".
```JavaScript
$("div#clock").clock("destroy");
```
