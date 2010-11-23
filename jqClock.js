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
 *         
 */

(function($, undefined) {

$.clock = { version: "1.0.0", locale: {} };

$.fn.clock = function(options) {

  this.locale = {
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
  $.extend(this.locale,$.clock.locale);

  return this.each(function(){
    options = options || {};  
    if(options=="destroy"){ $(this).updateClock($(this),"destroy"); }
    if(options.timestamp!=undefined){
      mytimestamp = options.timestamp;
      mytimestamp = new Date(options.timestamp);
    }
    else{ mytimestamp = new Date(); }
    options.langSet = options.langSet || "en";
    options.format = options.format || (options.langSet!="en") ? "24" : "12";

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
    ap="";
  
    if(options.format=="12"){
      ap=" AM";
      if (h > 11) { ap = " PM"; }
    	if (h > 12) { h = h - 12; }
    	if (h == 0) { h = 12; }
    }
    if(options.langSet=="en"&&options.format=="12"){
    	if(s==0&&m==0&&h==12){ $("div#currentdate").html(this.locale[langSet].weekdays[dy]+', '+this.locale[langset].months[mo]+' '+dt+', '+y); }
    }
    if(options.langSet=="en"&&options.format=="24"){
    	if(s==0&&m==0&&h==0){ $("div#currentdate").html(this.locale[langSet].weekdays[dy]+', '+this.locale[langset].months[mo]+' '+dt+', '+y); }
    }
    else{     
      if(options.format=="24"){
        if(s==0&&m==0&&h==0){ $("div#currentdate").html(this.locale[langSet].weekdays[dy]+', '+dt+' '+this.locale[langSet].months[mo]+' '+y); }
      }
      else{
        if(s==0&&m==0&&h==12){ $("div#currentdate").html(this.locale[langSet].weekdays[dy]+', '+dt+' '+this.locale[langSet].months[mo]+' '+y); }
      }
    }
    // add a zero in front of numbers 0-9
    h=addleadingzero(h);
    m=addleadingzero(m);
    s=addleadingzero(s);

    $(this).html(h+":"+m+":"+s+ap);
    $(this).updateClock($(this),{"timestamp":options.timestamp,"langSet":options.langSet,"format":options.format});
  });
}
    $.fn.updateClock = function(el,myoptions) {
        if(myoptions=="destroy"){ clearTimeout(t); }
        else { t = setTimeout(function() {$(el).clock(myoptions)}, 1000); }
    }
return this;

})(jQuery);
