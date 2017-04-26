var blue = "#66bd63";
var red = "#f46d43";

function monteCarloPi(){
  var width = d3.select('#pimc').node().getBoundingClientRect().width*0.75,
      height = width;
  var start = false;

  var numSamples = 0;
  var formatPi = d3.format('.10f');
  var rayon = width;
  var x = d3.scale.linear()
      .domain([-1,1])
      .range([0, rayon]);

  var y = d3.scale.linear()
      .domain([-1,1])
      .range([0, rayon]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .tickValues([-1,0.,1])
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .tickValues([-1,0.,1])
      .orient("left");

  var svg = d3.select("#pimc").append("svg:svg")
      .attr("width", width)
      .attr("height", height)
      .style("display", "block")
      .style("margin","auto");

  var value = d3.select("#pimc")
      .append("svg:svg")
      .attr("width", width)
      .attr("height", width*0.1)
      .style("display", "block")
      .style("margin","auto")
    .append("text")
    .attr("x", width*0.5)
    .attr("y", width*0.1)
    .style("text-anchor","middle")
    .style("font-size","35px")
    .text("π = 0");

  svg.append("circle")
    .attr("r",x(0.))
    .attr("cx",x(0.0))
    .attr("cy",y(0.0))
    .style("fill","none")
    .style("stroke","black")
    .style("stroke-width",2);

  svg.append("rect")
    .attr("x",x(-1.0))
    .attr("y",y(-1.0))
    .attr("width",x(1.0))
    .attr("height",y(1.0))
    .style("fill","none")
    .style("stroke","black")
    .style("stroke-width",2);





  var blues = 0,
      reds = 0,
      pi = 0;
  $('#start-pi').on('click',function(){

    start = !start;
    if (!start){
      $('#start-pi').html('<span class="glyphicon glyphicon-play" aria-hidden="true"></span>Start');
    } else {
      $('#start-pi').html('<span class="glyphicon glyphicon-pause" aria-hidden="true"></span>Pause');
    }
  });

  $('#reset-pi').on('click',function(){
    start = false;
    $('#start-pi').html('<span class="glyphicon glyphicon-play" aria-hidden="true"></span>Start');
    value.text("π = 0");
    blues = 0;
    reds = 0;
    numSamples = 0;
    svg.selectAll(".point").remove();
  });
  d3.timer(function() {

    if (start){
      var cx = -1 + 2*Math.random(),
          cy = -1 + 2*Math.random();

      if ((Math.pow(cx,2) + Math.pow(cy,2))< 1) {
        blues +=1;
        var color = "#66bd63";
      }else {
        reds +=1;
        var color = "#f46d43";
      };

      pi = (blues / (blues + reds)) * 4;

      value.text("π = " + formatPi(pi));

      svg.append("circle")
        .attr("class",'point')
        .attr("cx",x(cx))
        .attr("cy",y(cy))
        .attr("r",3)
        .style("fill",color);

      return ++numSamples > 5000;
    }
  });
}

function binomialProcess(){
  var width = d3.select('#bin-proc').node().getBoundingClientRect().width*0.75,
      height = width;
  var blue = "#66bd63";
  var red = "#f46d43";
  var pause = true;
  var tot_vals = 0;


  var x = d3.scale.linear()
      .domain([-1,1])
      .range([0, width]);

  var y = d3.scale.linear()
      .domain([-1,1])
      .range([0, height]);

  var svg = d3.select("#bin-proc").append("svg:svg")
      .attr("width", width)
      .attr("height", height)
      .style("display", "block")
      .style("margin","auto");

  var value_text = svg.append("text")
    .attr("x", x(0.1))
    .attr("y", y(0.0))
    .style("text-anchor","middle")
    .style("font-size","35px")
    .text("0");

  circles = []
  for (var i = 0; i < 10; i++){
    circles.push({x:x(1.8*((i+1)/10)-0.9),y:y(-0.75),
                  r:x(-0.9), heads: true, i: i
                });
  }

  squares = []
  for (var i=0; i < 11; i++){
    squares.push({x:x(1.8*(i/10)-0.9), y:y(0.5),
                  width:x(-0.9),value: 0, i: i})
  }

  svg.append("circle")

  svg.selectAll("circle")
      .data(circles)
    .enter().append("svg:circle")
    .attr("cx",function(d,i){return x(-0.9)})
    .attr("cy",function(d,i){return d.y})
    .attr("r",function(d,i){return d.r});

    svg.selectAll(".textLabel")
    .data(squares)
    .enter()
    .append("text")
    .attr("x", function(d,i){return d.x})
    .attr("y", function(d,i){return d.y})
    .style("font-size","18px")
    .text(function(d,i){return i});

    svg.selectAll("rect")
        .data(squares)
        .enter()
        .append("rect")
        .attr("x", function(d,i){return d.x})
        .attr("y", function(d,i){return d.y})
        .attr("width", function(d,i){return d.width})
        .attr("height", function(d,i){return d.value});



   $('#start-binom').on('click',function(){

     pause= !pause;
     if (!pause){

       $('#start-binom').html('<span class="glyphicon glyphicon-pause" aria-hidden="true"></span>Pause');
     } else {

       $('#start-binom').html('<span class="glyphicon glyphicon-play" aria-hidden="true"></span>Start');

     }
     compoundTransitions();
   });
   $('#reset-binom').on('click',function(){
     pause = true;
     tot_vals = 0;
     svg.selectAll("rect")
     .transition()
     .attr("height", function(d,i){
       d.value = 0;
       return d.value});
     $('#start-binom').html('<span class="glyphicon glyphicon-play" aria-hidden="true"></span>Start');
   });
    //d3.timer(function() {new transitions().aniBinom().aniHists(); });





      compoundTransitions = function(){
        if(!pause){
          var values = 0;
          var tspan = 750*(1-$('#speed-binom-value').data('value'));
          var p = $('#prob-binom-value').data('value');
          t0 = svg.transition();
          t0.selectAll("circle")
             .style("opacity",function(){
               values = 0;
               return 1
             })
             .style("fill", "black")
             .attr("cx",function(d,i){return x(-0.9)})
             .attr("cy",function(d,i){return d.y})


          t1 = t0.transition().duration(tspan);
          t1.selectAll("circle")
          .attr("cx",function(d,i){return d.x})
          .attr("cy",function(d,i){return d.y})
          .attr("heads", function(d,i){ circles[i].heads = (Math.random()<p);
                                        values += circles[i].heads;
                                        return circles[i].heads;
                                      });

          t2 = t1.transition().duration(tspan);
          t2.selectAll("circle")
          .style("fill", function(d,i){if (d.heads){
                                                      return blue;
                                                    } else {
                                                      return red;
                                                    }
          })

          t2.select("text")
          .style("opacity",1)
          .text(function(){
            tot_vals += 1;
            return values
          });

          t3 =  t2.transition().duration(tspan);
          t3.selectAll("circle")
          .attr("cx",function(d,i){
                                    if(d.heads){
                                      return x(-0.5);
                                    }else{
                                      return x(0.5);
                                    }
          })
          .attr("cy",function(d,i){return y(0.0)})
          .style("opacity",0);

          t3.select()

          t4 = t3.transition().duration(tspan);
          t4.selectAll("rect")
             .attr("height",function(d,i){
               if(values==i){
                 d.value += 1;
               }
               return y(-0.5)*d.value/tot_vals;
             });

          t4.select("text")
             .style("opacity",0);

          t4.transition().each("end", compoundTransitions);
        }

      }




}

//define and launch sliders.
$('#speed-binom').slider({tooltip: "hide"})
.on('change',function(slideEvt){
  $('#speed-binom-value').data("value", slideEvt.value.newValue);
});

$('#prob-binom').slider({})
.on('change',function(slideEvt){
  $('#prob-binom-value').data("value", slideEvt.value.newValue);
});

//define and launch sliders.
var bmean = $('#mean-bootstrap').slider({});
var bsample = $('#sample-bootstrap').slider({});

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//$('#start-pi').on('click',monteCarloPi);
// Standard Normal variate using Box-Muller transform.
function randn_bm() {
    var u = 1 - Math.random(); // Subtraction to flip [0, 1) to (0, 1].
    var v = 1 - Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function bootstrapProcess(){
  var width = d3.select('#bootstrap-example').node().getBoundingClientRect().width*0.75,
      height = width;
  var eps = width*0.05;
  var blue = "#66bd63";
  var red = "#f46d43";
  var pause = true;
  var tot_vals = 0;
  var mean2 = 1.0;

  var x = d3.scale.linear()
      .domain([-5,5])
      .range([0+eps, width-eps]);

  var y = d3.scale.linear()
      .domain([0,1.0])
      .range([height/3,0]);

  var textx = d3.scale.linear()
      .domain([0,1])
      .range([0, width]);

  var texty = d3.scale.linear()
      .domain([0,1.0])
      .range([2*height/3,height/3+eps]);

  var svg = d3.select("#bootstrap-example").append("svg:svg")
      .attr("width", width)
      .attr("height", height)
      .style("display", "block")
      .style("margin","auto");

  var line = d3.svg.line()
      .x(function(d) {
        return x(d.x);
      })
      .y(function(d) {
        return y(d.y);
      })
      .interpolate('linear');
  var formatNorm = d3.format('.2f');

  function genNormal(mu,sigma){
    var lineData = [];
    for(i=0;i<100;i++){
      xx = -5 + 10*(i/100);
      lineData.push({
        x: xx,
        y: (1/Math.sqrt(2*Math.PI*sigma))*
           Math.exp(-(0.5/sigma)*Math.pow(xx-mu,2))
      });
    }
    return lineData;
  }

  function drawNormal(data,color){



    svg.append('svg:path')
    .datum(data)
      .attr("class", "line")
      .attr("d", line)
      .style('fill','none')
      .style('stroke',color)
      .style('stroke-width','3px');


  }

  function drawNumbers(data){
    svg.selectAll(".numbersText")
    .data(data)
    .enter()
    .append("text")
    .attr("x", function(d,i){return textx(d.x)})
    .attr("y", function(d,i){return texty(d.y)})
    .attr("class","numbersText")
    .style("font-size",function(){return (x(2)/data.length)+"px"})
    .style("fill",function(d,i){return (d.category)? blue:red })
    .text(function(d,i){return formatNorm(d.value)});
  }

  function genData(mean2,numSamp){
    var data = [];

    for (i=0;i<2*numSamp;i++){
      mu = (i<numSamp)? 0: mean2;
      data.push({
        x:(i%numSamp)/numSamp,
        y:(i<numSamp)*1,
        value: randn_bm()+mu,
        category: 1*(i<numSamp)
      });
    }
    return data;
  }


  function meanDiff(data){
    mean1 = 0;
    mean2 = 0;
    sum1 = 0;
    sum2 = 0;
    for (i=0; i<data.length; i++){
      if (data[i].category==0){
        mean1 += data[i].value;
        sum1 += 1;
      } else {
        mean2 += data[i].value;
        sum2 += 2;
      }
    }
    return Math.abs(mean1/sum1 - mean2/sum2)
  }

  function drawMeanDiff(data){
    var diffs = [{value:meanDiff(data)}];
    svg.selectAll("#diffText")
    .data(diffs)
    .enter()
    .append("text")
    .attr("id","diffText")
    .attr("x", function(d,i){return textx(0.5)})
    .attr("y", function(d,i){return texty(0.5)})
    .style("font-size","24px")
    .text(function(d,i){return formatNorm(d.value)});
  }

  function permuteNumbers(data){
    data = shuffle(data);
    var nn = data.length/2;
    for (i=0;i<data.length;i++){
      data[i].category = (i<nn)? 0:1;
      data[i].color = (i<nn)? red:blue;
      data[i].x = (i%nn)/nn;
      data[i].y = (i<nn)*1;
    }
    return data;
  }

  function drawShuffle(data){
    svg.selectAll(".numbersText")
    .transition().duration(750)
    .attr("x", function(d,i){return textx(d.x)})
    .attr("y", function(d,i){return texty(d.y)})
    .style("fill",function(d,i){return (d.category)? blue:red });
  }

  function resetScenario(){
    var mm = Number(bmean.val());
    var numSamp = Number(bsample.val());
    data = genData(mm,numSamp);
    odiff = meanDiff(data);
    num_greater_diff = 0;
    num_samples = 0;
    svg.selectAll('path').remove();
    svg.selectAll(".numbersText").remove();

    svg.select("#diffText").text(function(d,i){return formatNorm(meanDiff(data))});
    svg.select("#probText").text(function(d,i){return 'P(M>'+formatNorm(odiff)+') = 0'});
    drawNormal(genNormal(0.,1.0),blue);
    drawNormal(genNormal(mm,1.0),red);
    drawNumbers(data);
  }

  //initialise
  drawNormal(genNormal(0.,1.0),blue);
  drawNormal(genNormal(mean2,1.0),red);
  var data = genData(mean2,10);
  drawNumbers(data);
  drawMeanDiff(data);
  var odiff = meanDiff(data);
  var num_greater_diff = 0;
  var num_samples = 0;
  svg.append("text")
  .attr("id","probText")
  .attr("x", function(d,i){return textx(0.33)})
  .attr("y", function(d,i){return texty(-0.5)})
  .style("font-size","24px")
  .text(function(d,i){return 'P(M>'+formatNorm(odiff)+') = 0'});

  //Number(bmean.val());
  bmean.on('change',function(){
    resetScenario();

  });

  bsample.on('change',function(){
    resetScenario();
  });

  function computePermutations(){
    if(!pause){
      data = permuteNumbers(data);
      if(meanDiff(data)>odiff) {num_greater_diff++;}
      num_samples++;

      t0 = svg.transition().duration(750);
      t0.selectAll(".numbersText")
      .attr("x", function(d,i){return textx(d.x)})
      .attr("y", function(d,i){return texty(d.y)})
      .style("fill",function(d,i){return (d.category)? blue:red });

      //drawShuffle(data);

      t0.select("#diffText")
      .text(function(d,i){return formatNorm(meanDiff(data))});


      t0.select("#probText")
      .text(function(d,i){return 'P(M>'+formatNorm(odiff)+') = '+formatNorm(num_greater_diff/num_samples)});

      t0.each("end", computePermutations);
    }
  }
  $('#start-bootstrap').on('click',function(){
    pause= !pause;
    if (!pause){

      $('#start-bootstrap').html('<span class="glyphicon glyphicon-pause" aria-hidden="true"></span>Pause');
    } else {

      $('#start-bootstrap').html('<span class="glyphicon glyphicon-play" aria-hidden="true"></span>Start');

    }
    computePermutations();

  });
  $('#reset-bootstrap').on('click',function(){
    pause = true;
    $('#start-bootstrap').html('<span class="glyphicon glyphicon-play" aria-hidden="true"></span>Start');
    resetScenario();

  });



}

window.onload = function () {
  monteCarloPi();
  binomialProcess();
  bootstrapProcess();


}
