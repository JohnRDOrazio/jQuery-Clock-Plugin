/* Sets time in clock div and calls itself every second */
/**
 * Clock plugin
 * Copyright (c) 2010 John R D'Orazio (donjohn.fmmi@gmail.com)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * 
 * Turns a jQuery dom element into a dynamic clock
 *  
 * @timestamp defaults to clients current time
 *   $("#mydiv").clock();
 *   >> will turn div into clock using client computer's current time
 * @timestamp server-side example:
 *   Say we have a hidden input with id='timestmp' the value of which is determined server-side with server's current time
 *   $("#mydiv").clock({"timestamp":$("#timestmp").val()});
 *   >> will turn div into clock passing in server's current time as retrieved from hidden input
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

(function($, undefined) {

$.clock = { version: "1.0.0", locale: {} }
  
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
    if(options=="destroy"){ $(this).updateClock($(this),"destroy"); }
    if(options.timestamp!=undefined){
      mytimestamp = options.timestamp;
      mytimestamp = new Date(options.timestamp);
    }
    else{ 
      options.timestamp = new Date();
      mytimestamp = options.timestamp;
      options.timestamp = options.timestamp.getTime();
    }
    options.langSet = options.langSet || "en";
    options.format = options.format || ((options.langSet!="en") ? "24" : "12");
    options.calendar = options.calendar || "true";

    options.timestamp += 1000;
    var addleadingzero = function(i){
      if (i<10){i="0" + i;}
      return i;    
    },
    h=mytimestamp.getHours(),
    m=mytimestamp.getMinutes(),
    s=mytimestamp.getSeconds(),
    dy=mytimestamp.getDay(),
    dt=mytimestamp.getDate(),
    mo=mytimestamp.getMonth(),
    y=mytimestamp.getFullYear(),
    ap="",
    calend="";
  
    if(options.format=="12"){
      ap=" AM";
      if (h > 11) { ap = " PM"; }
      if (h > 12) { h = h - 12; }
      if (h == 0) { h = 12; }
    }

    // add a zero in front of numbers 0-9
    h=addleadingzero(h);
    m=addleadingzero(m);
    s=addleadingzero(s);

    if(options.calendar!="false") {
      if (options.langSet=="en") {
        calend = "<span class='clockdate'>"+locale[options.langSet].weekdays[dy]+', '+locale[options.langSet].months[mo]+' '+dt+', '+y+"</span>";
      }
      else {
        calend = "<span class='clockdate'>"+locale[options.langSet].weekdays[dy]+', '+dt+' '+locale[options.langSet].months[mo]+' '+y+"</span>";
      }
    }
    if ( !$(this).hasClass("jqclock") ) {
      $(this).addClass("jqclock");
    }
    $(this).html(calend+"<span class='clocktime'>"+h+":"+m+":"+s+ap+"</span>");
    $(this).updateClock($(this),{"calendar":options.calendar,"timestamp":options.timestamp,"langSet":options.langSet,"format":options.format});
  });
}
  t = new Array();
  $.fn.updateClock = function(el,myoptions) {
    var el_id = $(el).attr("id");
    if(myoptions=="destroy"){ clearTimeout(t[el_id]); }
    else { t[el_id] = setTimeout(function() {$(el).clock(myoptions)}, 1000); }
    }

  return this;

})(jQuery);
