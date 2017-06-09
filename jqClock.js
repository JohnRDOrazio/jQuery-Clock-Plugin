/**
 * jQuery Clock plugin
 * Copyright (c) 2010 John R D'Orazio (priest@johnromanodorazio.com)
 * Licensed under the Apache 2.0 license:
 * https://www.apache.org/licenses/LICENSE-2.0
 * 
 * Turns a jQuery dom element into a dynamic clock
 *  
 * @timestamp defaults to clients current time
 *   $("#mydiv").clock();
 *   >> will turn div into clock using client computer's current time
 * @timestamp server-side example:
 *   Say we have a hidden input with id='timestmp' the value of which is determined server-side with server's current time
 *   tmstmp = parseInt($("#timestmp").val());
 *   $("#mydiv").clock({"timestamp":tmstmp});
 *   >> will turn div into clock passing in server's current time as retrieved from hidden input, and after being converted to a javascript style timestamp
 *    
 * @format defaults to 12 hour format,
 *   or if langSet is indicated defaults to most appropriate format for that langSet
 *   $("#mydiv").clock(); >> will have 12 hour format
 *   $("#mydiv").clock({"langSet":"it"}); >> will have 24 hour format
 *   $("#mydiv").clock({"langSet":"en"}); >> will have 12 hour format 
 *   $("#mydiv").clock({"langSet":"en","format":"24"}); >> will have military style 24 hour format
 *   $("#mydiv").clock({"calendar":true}); >> will include the date with the time, and will update the date at midnight
 *         
 */
/* Sets time in clock div and calls itself every second */

(function($, undefined) {

$.clock = { version: "2.0.9", locale: {} };

jqClock = [];

$.fn.clock = function(options) {
  var locale = {
    "it":{
      "weekdays":["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"],
      "months":["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"]
    },
    "en":{
      "weekdays":["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      "months":["January","February","March","April","May","June","July","August","September","October","November","December"]
    },
    "es":{
      "weekdays":["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
      "months":["Enero", "Febrero", "Marzo", "Abril", "May", "junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    },
    "de":{
      "weekdays":["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
      "months":["Januar", "Februar", "März", "April", "könnte", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
    },
    "fr":{
      "weekdays":["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
      "months":["Janvier", "Février", "Mars", "Avril", "May", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
    },
    "ru":{
      "weekdays":["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
      "months":["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"]
    }
  }

  
  return this.each(function(){
    $.extend(locale,$.clock.locale);
    options = options || {};  
    options.timestamp = options.timestamp || "systime";
    /* If we are using a local timestamp, our difference from local system time will be calculated as zero */
    options.sysdiff = 0;
    /* If instead we are using a server timestamp, our difference from local system time will be calculated as server time minus local time 
     * taking also into account the timezone offset that the local time will automatically compensate for 
     */
    if( options.timestamp != "systime" ){      
      var sysDateObj = new Date();
      var digitCountDiff = (sysDateObj.getTime()+'').length - (options.timestamp+'').length;
      if(digitCountDiff > 2){
        options.timestamp = options.timestamp * 1000;
        options.sysdiff = (options.timestamp - sysDateObj.getTime()) + (sysDateObj.getTimezoneOffset()*60*1000);    
      }
      else{
        options.sysdiff = options.timestamp - sysDateObj.getTime();
      }
    }
    options.langSet = options.langSet || "en";
    options.format = options.format || ((options.langSet!="en") ? "24" : "12");
    options.calendar = options.calendar || "true";
    options.seconds = options.seconds || "true";

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
        mo=mytimestamp_sysdiff.getMonth(),
        y=mytimestamp_sysdiff.getFullYear(),
        ap="",
        calend="";

        if(myoptions.format=="12"){
          ap=" AM";
          if (h > 11) { ap = " PM"; }
          if (h > 12) { h = h - 12; }
          if (h === 0) { h = 12; }
        }

        // add a zero in front of numbers 0-9
        h=addleadingzero(h);
        m=addleadingzero(m);
        s=addleadingzero(s);

        if(myoptions.calendar!="false") {
          if (myoptions.langSet=="en") {
            calend = "<span class='clockdate'>"+locale[myoptions.langSet].weekdays[dy]+', '+locale[myoptions.langSet].months[mo]+' '+dt+', '+y+"</span>";
          }
          else {
            calend = "<span class='clockdate'>"+locale[myoptions.langSet].weekdays[dy]+', '+dt+' '+locale[myoptions.langSet].months[mo]+' '+y+"</span>";
          }
        }
        $(el).html(calend+"<span class='clocktime'>"+h+":"+m+(options.seconds == "true"?":"+s:"")+ap+"</span>");
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
