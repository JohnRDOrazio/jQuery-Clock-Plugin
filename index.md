<head>
  <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
  <script type="text/javascript" src="jqClock.min.js"></script>
  <script type="text/javascript">
    $(document).ready(function(){
    
      $.clock.locale = {"pt":{"weekdays":["Domingo","Segunda-feira", "Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira", "Sábado"],"months":["Janeiro","Fevereiro","Março","Abril", "Maio","Junho","Julho","Agosto","Setembro","October","Novembro", "Dezembro"] } };
      
      $("#clock1").clock();
      $("#clock2").clock({"langSet":"it"});
      $("#clock3").clock({"langSet":"pt"});
      $("#clock4").clock({"format":"24","calendar":"false"});
      
      customtimestamp = new Date();
      customtimestamp = customtimestamp.getTime();
      customtimestamp = customtimestamp+1123200000+10800000+14000;
      $("#clock5").clock({"timestamp":customtimestamp});
      
      $("#destroyclock1").click(function(){ $("#clock1").clock("destroy") });
      $("#destroyclock2").click(function(){ $("#clock2").clock("destroy") });
      $("#destroyclock3").click(function(){ $("#clock3").clock("destroy") });
      $("#destroyclock4").click(function(){ $("#clock4").clock("destroy") });
      $("#destroyclock5").click(function(){ $("#clock5").clock("destroy") });
                                           
    });    
  </script>
  <link rel="stylesheet" type="text/css" href="jqClock.css" />
</head>
<body>
<div>
  <header>
    <h1>Example page for Lwangaman's dynamic jquery clock plugin</h1>
  </header>

  <div style="clear:both;">
    <h2>Clock that uses default options</h2>
    <div id="clock1">This div will be turned into a dynamic clock</div>
    <button id="destroyclock1">DESTROY CLOCK 1</button>
  </div>
  <hr style="clear:both;" />
  <div style="clear:both;">
    <h2>Clock that uses included italian language</h2>
    <div id="clock2">This div will be turned into a dynamic clock</div>
    <button id="destroyclock2">DESTROY CLOCK 2</button>
  </div>
  <hr style="clear:both;" />
  <div style="clear:both;">
    <h2>Clock that uses extended portoguese language</h2>
    <div id="clock3">This div will be turned into a dynamic clock</div>
    <button id="destroyclock3">DESTROY CLOCK 3</button>
  </div>
  <hr style="clear:both;" />
  <div style="clear:both;">
    <h2>Clock in 24 hour format, without calendar</h2>
    <div id="clock4">This div will be turned into a dynamic clock</div>
    <button id="destroyclock4">DESTROY CLOCK 4</button>
  </div>
  <hr style="clear:both;" />
  <div style="clear:both;">
    <h2>Clock with custom timestamp (13 days, 3 hours and 14 seconds ahead)</h2>
    <div id="clock5">This div will be turned into a dynamic clock</div>
    <button id="destroyclock5">DESTROY CLOCK 5</button>
  </div>
  <hr style="clear:both;" />
  <h2>The advantage of this clock plugin is that it can also handle a server timestamp! Unfortunately it is not possible to give an example of this on github pages.</h2>
  

    <footer>
     <p>&copy; Copyright 2011 by Lwangaman <a href="mailto:priest@johnromanodorazio.com"></a> </p>
    </footer>
</div>
</body>
