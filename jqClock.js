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
 * @calendar defaults to "true", possible value are: "true", "false"
 * @dateFormat defaults to "l, F j, Y" when langSet=="en", else to "l, j F Y"
 * @timeFormat defaults to "h:i:s A" when langSet=="en", else to "H:i:s"
 * 
 *   $("#mydiv").clock(); >> will display in English and in 12 hour format
 *   $("#mydiv").clock({"langSet":"it"}); >> will display in Italian and in 24 hour format
 *   $("#mydiv").clock({"langSet":"en","timeFormat":"H:i:s"}); >> will display in English but in 24 hour format
 *   $("#mydiv").clock({"calendar":"false"}); >> will remove the date from the clock and display only the time
 * 
 *   Custom timestamp example, say we have a hidden input with id='timestmp' the value of which is determined server-side with server's current time:
 * 
 *   <input type="hidden" id="timestmp" value="<?php echo time(); ?>" />
 *   tmstmp = parseInt($("#timestmp").val());
 *   $("#mydiv").clock({"timestamp":tmstmp});
 *   >> will turn div into clock passing in server's current time as retrieved from hidden input
 *   
 */

(function($, undefined) {

	$.clock = { locale: {} };
	Object.defineProperty($.clock,"version",{
	  value: "2.1.3",
	  writable: false
	});

	jqClock = [];

	$.fn.clock = function(options) {
		var locale = {
			"am":{
				"weekdays":["እሑድ","ሰኞ","ማክሰኞ","ረቡዕ","ሐሙስ","ዓርብ","ቅዳሜ"],
				"shortWeekdays":["እሑድ","ሰኞ","ማክሰ","ረቡዕ","ሐሙስ","ዓርብ","ቅዳሜ"],
				"months":["ጃንዩወሪ","ፌብሩወሪ","ማርች","ኤፕሪል","ሜይ","ጁን","ጁላይ","ኦገስት","ሴፕቴምበር","ኦክቶበር","ኖቬምበር","ዲሴምበር"],
				"shortMonths":["ጃንዩ","ፌብሩ","ማርች","ኤፕሪ","ሜይ","ጁን","ጁላይ","ኦገስ","ሴፕቴ","ኦክቶ","ኖቬም","ዲሴም"]
			},
			"ar":{
				"weekdays":["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
				"shortWeekdays":["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
				"months":["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
				"shortMonths":["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"]
			},
			"bn":{
				"weekdays":["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহষ্পতিবার","শুক্রবার","শনিবার"],
				"shortWeekdays":["রবি","সোম","মঙ্গল","বুধ","বৃহস্পতি","শুক্র","শনি"],
				"months":["জানুয়ারী","ফেব্রুয়ারী","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"],
				"shortMonths":["জানুয়ারী","ফেব্রুয়ারী","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"]
			},
			"bg":{
				"weekdays":["неделя","понеделник","вторник","сряда","четвъртък","петък","събота"],
				"shortWeekdays":["нд","пн","вт","ср","чт","пт","сб"],
				"months":["януари","февруари","март","април","май","юни","юли","август","септември","октомври","ноември","декември"],
				"shortMonths":["01","02","03","04","05","06","07","08","09","10","11","12"]
			},
			"ca":{
				"weekdays":["diumenge","dilluns","dimarts","dimecres","dijous","divendres","dissabte"],
				"shortWeekdays":["dg.","dl.","dt.","dc.","dj.","dv.","ds."],
				"months":["gener","febrer","març","abril","maig","juny","juliol","agost","setembre","octubre","novembre","desembre"],
				"shortMonths":["gen.","febr.","març","abr.","maig","juny","jul.","ag.","set.","oct.","nov.","des."]
			},
			"zh":{
				"weekdays":["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],
				"shortWeekdays":["周日","周一","周二","周三","周四","周五","周六"],
				"months":["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],
				"shortMonths":["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"]
			},
			"hr":{
				"weekdays":["nedjelja","ponedjeljak","utorak","srijeda","četvrtak","petak","subota"],
				"shortWeekdays":["ned","pon","uto","sri","čet","pet","sub"],
				"months":["siječanj","veljača","ožujak","travanj","svibanj","lipanj","srpanj","kolovoz","rujan","listopad","studeni","prosinac"],
				"shortMonths":["sij","velj","ožu","tra","svi","lip","srp","kol","ruj","lis","stu","pro"]
			},
			"cs":{
				"weekdays":["neděle","pondělí","úterý","středa","čtvrtek","pátek","sobota"],
				"shortWeekdays":["ne","po","út","st","čt","pá","so"],
				"months":["leden","únor","březen","duben","květen","červen","červenec","srpen","září","říjen","listopad","prosinec"],
				"shortMonths":["led","úno","bře","dub","kvě","čvn","čvc","srp","zář","říj","lis","pro"]
			},
			"da":{
				"weekdays":["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"],
				"shortWeekdays":["søn","man","tir","ons","tor","fre","lør"],
				"months":["januar","februar","marts","april","maj","juni","juli","august","september","oktober","november","december"],
				"shortMonths":["jan.","feb.","mar.","apr.","maj","jun.","jul.","aug.","sep.","okt.","nov.","dec."]
			},
			"nl":{
				"weekdays":["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],
				"shortWeekdays":["zo","ma","di","wo","do","vr","za"],
				"months":["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"],
				"shortMonths":["jan.","feb.","mrt.","apr.","mei","jun.","jul.","aug.","sep.","okt.","nov.","dec."]
			},
			"en":{
				"weekdays":["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
				"shortWeekdays":["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
				"months":["January","February","March","April","May","June","July","August","September","October","November","December"],
				"shortMonths":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
			},
			"et":{
				"weekdays":["pühapäev","esmaspäev","teisipäev","kolmapäev","neljapäev","reede","laupäev"],
				"shortWeekdays":["P","E","T","K","N","R","L"],
				"months":["jaanuar","veebruar","märts","aprill","mai","juuni","juuli","august","september","oktoober","november","detsember"],
				"shortMonths":["jaanuar","veebruar","märts","aprill","mai","juuni","juuli","august","september","oktoober","november","detsember"]
			},
			"fi":{
				"weekdays":["sunnuntai","maanantai","tiistai","keskiviikko","torstai","perjantai","lauantai"],
				"shortWeekdays":["su","ma","ti","ke","to","pe","la"],
				"months":["tammikuu","helmikuu","maaliskuu","huhtikuu","toukokuu","kesäkuu","heinäkuu","elokuu","syyskuu","lokakuu","marraskuu","joulukuu"],
				"shortMonths":["tammi","helmi","maalis","huhti","touko","kesä","heinä","elo","syys","loka","marras","joulu"]
			},
			"fr":{
				"weekdays":["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],
				"shortWeekdays":["dim.","lun.","mar.","mer.","jeu.","ven.","sam."],
				"months":["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],
				"shortMonths":["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."]
			},
			"de":{
				"weekdays":["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],
				"shortWeekdays":["So","Mo","Di","Mi","Do","Fr","Sa"],
				"months":["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],
				"shortMonths":["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"]
			},
			"el":{
				"weekdays":["Κυριακή","Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο"],
				"shortWeekdays":["Κυρ","Δευ","Τρί","Τετ","Πέμ","Παρ","Σάβ"],
				"months":["Ιανουαρίου","Φεβρουαρίου","Μαρτίου","Απριλίου","Μαΐου","Ιουνίου","Ιουλίου","Αυγούστου","Σεπτεμβρίου","Οκτωβρίου","Νοεμβρίου","Δεκεμβρίου"],
				"shortMonths":["Ιαν","Φεβ","Μαρ","Απρ","Μαΐ","Ιουν","Ιουλ","Αυγ","Σεπ","Οκτ","Νοε","Δεκ"]
			},
			"gu":{
				"weekdays":["રવિવાર","સોમવાર","મંગળવાર","બુધવાર","ગુરુવાર","શુક્રવાર","શનિવાર"],
				"shortWeekdays":["રવિ","સોમ","મંગળ","બુધ","ગુરુ","શુક્ર","શનિ"],
				"months":["જાન્યુઆરી","ફેબ્રુઆરી","માર્ચ","એપ્રિલ","મે","જૂન","જુલાઈ","ઑગસ્ટ","સપ્ટેમ્બર","ઑક્ટોબર","નવેમ્બર","ડિસેમ્બર"],
				"shortMonths":["જાન્યુ","ફેબ્રુ","માર્ચ","એપ્રિલ","મે","જૂન","જુલાઈ","ઑગસ્ટ","સપ્ટે","ઑક્ટો","નવે","ડિસે"]
			},
			"hi":{
				"weekdays":["रविवार","सोमवार","मंगलवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"],
				"shortWeekdays":["रवि","सोम","मंगल","बुध","गुरु","शुक्र","शनि"],
				"months":["जनवरी","फ़रवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्तूबर","नवंबर","दिसंबर"],
				"shortMonths":["जन॰","फ़र॰","मार्च","अप्रैल","मई","जून","जुल॰","अग॰","सित॰","अक्तू॰","नव॰","दिस॰"]
			},
			"hu":{
				"weekdays":["vasárnap","hétfő","kedd","szerda","csütörtök","péntek","szombat"],
				"shortWeekdays":["V","H","K","Sze","Cs","P","Szo"],
				"months":["január","február","március","április","május","június","július","augusztus","szeptember","október","november","december"],
				"shortMonths":["jan.","febr.","márc.","ápr.","máj.","jún.","júl.","aug.","szept.","okt.","nov.","dec."]
			},
			"id":{
				"weekdays":["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"],
				"shortWeekdays":["Min","Sen","Sel","Rab","Kam","Jum","Sab"],
				"months":["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"],
				"shortMonths":["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"]
			},
			"it":{
				"weekdays":["domenica","lunedì","martedì","mercoledì","giovedì","venerdì","sabato"],
				"shortWeekdays":["dom","lun","mar","mer","gio","ven","sab"],
				"months":["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"],
				"shortMonths":["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"]
			},
			"ja":{
				"weekdays":["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"],
				"shortWeekdays":["日","月","火","水","木","金","土"],
				"months":["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
				"shortMonths":["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"]
			},
			"kn":{
				"weekdays":["ಭಾನುವಾರ","ಸೋಮವಾರ","ಮಂಗಳವಾರ","ಬುಧವಾರ","ಗುರುವಾರ","ಶುಕ್ರವಾರ","ಶನಿವಾರ"],
				"shortWeekdays":["ಭಾನು","ಸೋಮ","ಮಂಗಳ","ಬುಧ","ಗುರು","ಶುಕ್ರ","ಶನಿ"],
				"months":["ಜನವರಿ","ಫೆಬ್ರವರಿ","ಮಾರ್ಚ್","ಏಪ್ರಿಲ್","ಮೇ","ಜೂನ್","ಜುಲೈ","ಆಗಸ್ಟ್","ಸೆಪ್ಟೆಂಬರ್","ಅಕ್ಟೋಬರ್","ನವೆಂಬರ್","ಡಿಸೆಂಬರ್"],
				"shortMonths":["ಜನ","ಫೆಬ್ರ","ಮಾರ್ಚ್","ಏಪ್ರಿ","ಮೇ","ಜೂನ್","ಜುಲೈ","ಆಗ","ಸೆಪ್ಟೆಂ","ಅಕ್ಟೋ","ನವೆಂ","ಡಿಸೆಂ"]
			},
			"ko":{
				"weekdays":["일요일","월요일","화요일","수요일","목요일","금요일","토요일"],
				"shortWeekdays":["일","월","화","수","목","금","토"],
				"months":["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],
				"shortMonths":["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"]
			},
			"lv":{
				"weekdays":["Svētdiena","Pirmdiena","Otrdiena","Trešdiena","Ceturtdiena","Piektdiena","Sestdiena"],
				"shortWeekdays":["Svētd.","Pirmd.","Otrd.","Trešd.","Ceturtd.","Piektd.","Sestd."],
				"months":["janvāris","februāris","marts","aprīlis","maijs","jūnijs","jūlijs","augusts","septembris","oktobris","novembris","decembris"],
				"shortMonths":["janv.","febr.","marts","apr.","maijs","jūn.","jūl.","aug.","sept.","okt.","nov.","dec."]
			},
			"lt":{
				"weekdays":["sekmadienis","pirmadienis","antradienis","trečiadienis","ketvirtadienis","penktadienis","šeštadienis"],
				"shortWeekdays":["sk","pr","an","tr","kt","pn","št"],
				"months":["sausis","vasaris","kovas","balandis","gegužė","birželis","liepa","rugpjūtis","rugsėjis","spalis","lapkritis","gruodis"],
				"shortMonths":["01","02","03","04","05","06","07","08","09","10","11","12"]
			},
			"ms":{
				"weekdays":["Ahad","Isnin","Selasa","Rabu","Khamis","Jumaat","Sabtu"],
				"shortWeekdays":["Ahd","Isn","Sel","Rab","Kha","Jum","Sab"],
				"months":["Januari","Februari","Mac","April","Mei","Jun","Julai","Ogos","September","Oktober","November","Disember"],
				"shortMonths":["Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ogo","Sep","Okt","Nov","Dis"]
			},
			"ml":{
				"weekdays":["ഞായറാഴ്‌ച","തിങ്കളാഴ്‌ച","ചൊവ്വാഴ്‌ച","ബുധനാഴ്‌ച","വ്യാഴാഴ്‌ച","വെള്ളിയാഴ്‌ച","ശനിയാഴ്‌ച"],
				"shortWeekdays":["ഞായർ","തിങ്കൾ","ചൊവ്വ","ബുധൻ","വ്യാഴം","വെള്ളി","ശനി"],
				"months":["ജനുവരി","ഫെബ്രുവരി","മാർച്ച്","ഏപ്രിൽ","മേയ്","ജൂൺ","ജൂലൈ","ഓഗസ്റ്റ്","സെപ്റ്റംബർ","ഒക്‌ടോബർ","നവംബർ","ഡിസംബർ"],
				"shortMonths":["ജനു","ഫെബ്രു","മാർ","ഏപ്രി","മേയ്","ജൂൺ","ജൂലൈ","ഓഗ","സെപ്റ്റം","ഒക്ടോ","നവം","ഡിസം"]
			},
			"mr":{
				"weekdays":["रविवार","सोमवार","मंगळवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"],
				"shortWeekdays":["रवि","सोम","मंगळ","बुध","गुरु","शुक्र","शनि"],
				"months":["जानेवारी","फेब्रुवारी","मार्च","एप्रिल","मे","जून","जुलै","ऑगस्ट","सप्टेंबर","ऑक्टोबर","नोव्हेंबर","डिसेंबर"],
				"shortMonths":["जाने","फेब्रु","मार्च","एप्रि","मे","जून","जुलै","ऑग","सप्टें","ऑक्टो","नोव्हें","डिसें"]
			},
			"mo":{
				"weekdays":["duminică","luni","marți","miercuri","joi","vineri","sâmbătă"],
				"shortWeekdays":["Dum","Lun","Mar","Mie","Joi","Vin","Sâm"],
				"months":["ianuarie","februarie","martie","aprilie","mai","iunie","iulie","august","septembrie","octombrie","noiembrie","decembrie"],
				"shortMonths":["ian.","feb.","mar.","apr.","mai","iun.","iul.","aug.","sept.","oct.","nov.","dec."]
			},
			"ps":{
				"weekdays":["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
				"shortWeekdays":["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
				"months":["Dey","Bahman","Esfand","Farvardin","Ordibehesht","Khordad","Tir","Mordad","Shahrivar","Mehr","Aban","Azar"],
				"shortMonths":["Dey","Bahman","Esfand","Farvardin","Ordibehesht","Khordad","Tir","Mordad","Shahrivar","Mehr","Aban","Azar"]
			},
			"fa":{
				"weekdays":["یکشنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنجشنبه","جمعه","شنبه"],
				"shortWeekdays":["یکشنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنجشنبه","جمعه","شنبه"],
				"months":["دی","بهمن","اسفند","فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر"],
				"shortMonths":["دی","بهمن","اسفند","فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر"]
			},
			"pl":{
				"weekdays":["niedziela","poniedziałek","wtorek","środa","czwartek","piątek","sobota"],
				"shortWeekdays":["niedz.","pon.","wt.","śr.","czw.","pt.","sob."],
				"months":["styczeń","luty","marzec","kwiecień","maj","czerwiec","lipiec","sierpień","wrzesień","październik","listopad","grudzień"],
				"shortMonths":["sty","lut","mar","kwi","maj","cze","lip","sie","wrz","paź","lis","gru"]
			},
			"pt":{
				"weekdays":["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"],
				"shortWeekdays":["dom","seg","ter","qua","qui","sex","sáb"],
				"months":["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"],
				"shortMonths":["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"]
			},
			"ro":{
				"weekdays":["duminică","luni","marți","miercuri","joi","vineri","sâmbătă"],
				"shortWeekdays":["dum.","lun.","mar.","mie.","joi","vin.","sâm."],
				"months":["ianuarie","februarie","martie","aprilie","mai","iunie","iulie","august","septembrie","octombrie","noiembrie","decembrie"],
				"shortMonths":["ian.","feb.","mar.","apr.","mai","iun.","iul.","aug.","sept.","oct.","nov.","dec."]
			},
			"ru":{
				"weekdays":["воскресенье","понедельник","вторник","среда","четверг","пятница","суббота"],
				"shortWeekdays":["вс","пн","вт","ср","чт","пт","сб"],
				"months":["январь","февраль","март","апрель","май","июнь","июль","август","сентябрь","октябрь","ноябрь","декабрь"],
				"shortMonths":["янв.","февр.","март","апр.","май","июнь","июль","авг.","сент.","окт.","нояб.","дек."]
			},
			"sr":{
				"weekdays":["недеља","понедељак","уторак","среда","четвртак","петак","субота"],
				"shortWeekdays":["нед","пон","уто","сре","чет","пет","суб"],
				"months":["јануар","фебруар","март","април","мај","јун","јул","август","септембар","октобар","новембар","децембар"],
				"shortMonths":["јан","феб","мар","апр","мај","јун","јул","авг","сеп","окт","нов","дец"]
			},
			"sk":{
				"weekdays":["nedeľa","pondelok","utorok","streda","štvrtok","piatok","sobota"],
				"shortWeekdays":["ne","po","ut","st","št","pi","so"],
				"months":["január","február","marec","apríl","máj","jún","júl","august","september","október","november","december"],
				"shortMonths":["jan","feb","mar","apr","máj","jún","júl","aug","sep","okt","nov","dec"]
			},
			"sl":{
				"weekdays":["nedelja","ponedeljek","torek","sreda","četrtek","petek","sobota"],
				"shortWeekdays":["ned.","pon.","tor.","sre.","čet.","pet.","sob."],
				"months":["januar","februar","marec","april","maj","junij","julij","avgust","september","oktober","november","december"],
				"shortMonths":["jan.","feb.","mar.","apr.","maj","jun.","jul.","avg.","sep.","okt.","nov.","dec."]
			},
			"es":{
				"weekdays":["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],
				"shortWeekdays":["dom.","lun.","mar.","mié.","jue.","vie.","sáb."],
				"months":["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],
				"shortMonths":["ene.","feb.","mar.","abr.","may.","jun.","jul.","ago.","sept.","oct.","nov.","dic."]
			},
			"sw":{
				"weekdays":["Jumapili","Jumatatu","Jumanne","Jumatano","Alhamisi","Ijumaa","Jumamosi"],
				"shortWeekdays":["Jumapili","Jumatatu","Jumanne","Jumatano","Alhamisi","Ijumaa","Jumamosi"],
				"months":["Januari","Februari","Machi","Aprili","Mei","Juni","Julai","Agosti","Septemba","Oktoba","Novemba","Desemba"],
				"shortMonths":["Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ago","Sep","Okt","Nov","Des"]
			},
			"sv":{
				"weekdays":["söndag","måndag","tisdag","onsdag","torsdag","fredag","lördag"],
				"shortWeekdays":["sön","mån","tis","ons","tors","fre","lör"],
				"months":["januari","februari","mars","april","maj","juni","juli","augusti","september","oktober","november","december"],
				"shortMonths":["jan.","feb.","mars","apr.","maj","juni","juli","aug.","sep.","okt.","nov.","dec."]
			},
			"ta":{
				"weekdays":["ஞாயிறு","திங்கள்","செவ்வாய்","புதன்","வியாழன்","வெள்ளி","சனி"],
				"shortWeekdays":["ஞாயி.","திங்.","செவ்.","புத.","வியா.","வெள்.","சனி"],
				"months":["ஜனவரி","பிப்ரவரி","மார்ச்","ஏப்ரல்","மே","ஜூன்","ஜூலை","ஆகஸ்ட்","செப்டம்பர்","அக்டோபர்","நவம்பர்","டிசம்பர்"],
				"shortMonths":["ஜன.","பிப்.","மார்.","ஏப்.","மே","ஜூன்","ஜூலை","ஆக.","செப்.","அக்.","நவ.","டிச."]
			},
			"te":{
				"weekdays":["ఆదివారం","సోమవారం","మంగళవారం","బుధవారం","గురువారం","శుక్రవారం","శనివారం"],
				"shortWeekdays":["ఆది","సోమ","మంగళ","బుధ","గురు","శుక్ర","శని"],
				"months":["జనవరి","ఫిబ్రవరి","మార్చి","ఏప్రిల్","మే","జూన్","జులై","ఆగస్టు","సెప్టెంబర్","అక్టోబర్","నవంబర్","డిసెంబర్"],
				"shortMonths":["జన","ఫిబ్ర","మార్చి","ఏప్రి","మే","జూన్","జులై","ఆగస్టు","సెప్టెం","అక్టో","నవం","డిసెం"]
			},
			"th":{
				"weekdays":["วันอาทิตย์","วันจันทร์","วันอังคาร","วันพุธ","วันพฤหัสบดี","วันศุกร์","วันเสาร์"],
				"shortWeekdays":["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."],
				"months":["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"],
				"shortMonths":["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."]
			},
			"tr":{
				"weekdays":["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"],
				"shortWeekdays":["Paz","Pzt","Sal","Çar","Per","Cum","Cmt"],
				"months":["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"],
				"shortMonths":["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"]
			},
			"uk":{
				"weekdays":["неділя","понеділок","вівторок","середа","четвер","пʼятниця","субота"],
				"shortWeekdays":["нд","пн","вт","ср","чт","пт","сб"],
				"months":["січень","лютий","березень","квітень","травень","червень","липень","серпень","вересень","жовтень","листопад","грудень"],
				"shortMonths":["січ","лют","бер","кві","тра","чер","лип","сер","вер","жов","лис","гру"]
			},
			"vi":{
				"weekdays":["Chủ Nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"],
				"shortWeekdays":["CN","Th 2","Th 3","Th 4","Th 5","Th 6","Th 7"],
				"months":["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"],
				"shortMonths":["Thg 1","Thg 2","Thg 3","Thg 4","Thg 5","Thg 6","Thg 7","Thg 8","Thg 9","Thg 10","Thg 11","Thg 12"]
			}
		}

		return this.each(function(){
			$.extend(locale,$.clock.locale);
			options = options || {};
			
			/* User passable options: make sure we have default values if user doesn't pass them! */
			options.timestamp = options.timestamp || "localsystime";
			options.langSet = options.langSet || "en";
			options.calendar = options.calendar || "true";
			options.dateFormat = options.dateFormat || ((options.langSet=="en") ? "l, F j, Y" : "l, j F Y");
			options.timeFormat = options.timeFormat || ((options.langSet=="en") ? "h:i:s A" : "H:i:s");
			options.timezone = options.timezone || "localsystimezone"; //should only really be passed in when a server timestamp is passed
			
			/* Non user passable options */
			
			//this is useful only for client timestamps...
			var sysDateObj = new Date();
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
					    mo=mytimestamp_sysdiff.getMonth(),
					    y=mytimestamp_sysdiff.getFullYear(),
					    ap="AM",
					    calend="";
					if (h > 11) { ap = "PM"; }

					if(myoptions.calendar!="false") {

						/* Format Date String according to PHP style Format Characters http://php.net/manual/en/function.date.php */
						var dateStr = "";
						for(var n = 0; n <= myoptions.dateFormat.length; n++) {
							var chr = myoptions.dateFormat.charAt(n);
							switch(chr){
								case "d":
								  dateStr += addleadingzero(dt);
								  break;
								case "D":
								  dateStr += locale[myoptions.langSet].shortWeekdays[dy];
								  break;
								case "j":
								  dateStr += dt;
								  break;
								case "l":
								  dateStr += locale[myoptions.langSet].weekdays[dy];
								  break;
								case "F":
								  dateStr += locale[myoptions.langSet].months[mo];
								  break;
								case "m":
								  dateStr += addleadingzero(mo);
								  break;
								case "M":
								  dateStr += locale[myoptions.langSet].shortMonths[mo];
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
