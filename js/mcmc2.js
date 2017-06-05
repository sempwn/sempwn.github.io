var blue = "#66bd63";
var red = "#f46d43";

mod = function(a,n) {
    return ((a%n)+n)%n;
};


function graphingWalker(div,run_div,reset_div,drift){


  var width = d3.select(div).node().getBoundingClientRect().width,
      height = 0.5*width;

  var margin = {top: height/10., right: width/10., bottom: height/10, left: width/10};
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  var svg = d3.select(div).append("svg:svg")
      .attr("width", width)
      .attr("height", height)
      .style("display", "block")
      .style("margin","auto")
      .append("g")
          .attr("transform","translate(" + margin.left + "," + 0 + ")");
      //.attr("transform","translate(" + margin.left + "," + margin.top + ")");

      // Set the dimensions of the canvas / graph




    // Set the ranges
    var x = d3.scale.linear().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("top").ticks(5);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(5);

    // Define the line
    var valueline = d3.svg.line()
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y); })






    // Get the data
    var data = [];
    var xpoint = 0;
    var ypoint = 0;
    var pause = true;
    var p = 0.5;



    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.x; }));
    y.domain([0, d3.max(data, function(d) { return d.y; })]);

    // Add the valueline path.
    var paths = svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(data))
        .attr("stroke",blue)
        .attr("fill",'none');

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + 0.85*height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    function walk(){
      if(!pause){
          if(drift){
              p = 1 - $('#prob-walker-value').data('value');
          }
          data.push({x:xpoint++,y:ypoint+=(Math.random()<p)?-1:1});
          console.log(xpoint,ypoint);
          // Scale the range of the data
          x.domain(d3.extent(data, function(d) { return d.x; }));
          y.domain(d3.extent(data, function(d) { return d.y; }));
          t = paths.transition().duration(100)
          .attr("d", valueline(data));
          t.transition().each("end", walk);
      }
    }

    d3.select(run_div).on('click',function(){
        pause= !pause;
        if (!pause){

          $(run_div).html('<span class="glyphicon glyphicon-pause" aria-hidden="true"></span>Pause');
        } else {

          $(run_div).html('<span class="glyphicon glyphicon-play" aria-hidden="true"></span>Run');

        }
        walk();
    });
    d3.select(reset_div).on("click",function(){
        data = [];
        x.domain(d3.extent(data, function(d) { return d.x; }));
        y.domain(d3.extent(data, function(d) { return d.y; }));
        t = paths.transition().duration(100)
        .attr("d", valueline(data));
    });
}

function simpleWalker(){
  var width = d3.select('#simple-walker-example').node().getBoundingClientRect().width*0.75,
      height = 0.3*width;

  var svg = d3.select("#simple-walker-example").append("svg:svg")
      .attr("width", width)
      .attr("height", height)
      .style("display", "block")
      .style("margin","auto");


  var x = d3.scale.linear()
      .domain([-1,1])
      .range([0, width]);

  var y = d3.scale.linear()
      .domain([-1,1])
      .range([0, height]);

  var points = []
  var pos = 0;

  function boxPlacement(i){
    return 1.8*(i/5)-0.8
  }


  for (var i = 0; i < 5; i++){
    points.push({x:x(boxPlacement(i)),y:y(-0.75),width:x(-0.8)});
  }

  function circlePlacement(i){
    return 1.8*(i/5)-0.8;
  }

  /*svg.append("text")
    .attr("dx", x(-0.25))
    .attr("dy", y(-0.9))
    .style("font-size","18px")
    .text("Walker");*/





  svg.selectAll("rect")
    .data(points)
    .enter()
    .append("rect")
    .attr("class","markov-states")
    .attr("x", function(d,i){return d.x})
    .attr("y", function(d,i){return d.y})
    .attr("width", function(d,i){return d.width})
    .attr("height", function(d,i){return d.width})
    .style("fill", function(d) { return red });

  var walker = svg.append("circle")
                  .attr("cx", x(-0.0))
                  .attr("cy", y(-0.75)+x(-0.9))
                  .attr("r",x(-0.9))
                  .attr("pos",0)
                  .style("fill",blue);

  function randomWalk(){

    //pos = mod(pos + ((Math.random()<0.5)? 1:-1),5);
    pos = pos + ((Math.random()<0.5)? 1:-1);
    pos = (pos<0)? 0:(pos>4)? 4:pos;
    var t = walker.transition().duration(200)
    .attr("cx",function(d,i){return x(circlePlacement(pos))+0.5*x(-0.8)});
    t.transition().each("end", randomWalk);
  }

  randomWalk();

}

function networkProcess(){
  var width = d3.select('#network-example').node().getBoundingClientRect().width*0.75,
      height = width;

  var svg = d3.select("#network-example").append("svg:svg")
      .attr("width", width)
      .attr("height", height)
      .style("display", "block")
      .style("margin","auto");


  var pause = true;
  var color = d3.scale.category20c();
  var n = 10;

  function findNeighbours(mynode,links){
    var neighbours = [];
    for(var i=0; i<links.length;i++){
      if (links[i].source.index == mynode){
        neighbours.push(links[i].target.index);
      }
      if (links[i].target.index == mynode){
        neighbours.push(links[i].source.index);
      }
    }
    return neighbours
  }

  function transitionNode(mynode,links){
    var neighbours = findNeighbours(mynode,links);
    var rn = Math.floor(Math.random()*neighbours.length);
    var new_node = neighbours[rn];
    if(new_node===undefined){

      new_node = Math.floor(Math.random()*(n*n));
    }
    return new_node
  }







  function initialiseNetwork(){
      var n = 10;
      var t = 0;
      var nodes = [],
          links = [];
      var mynode = Math.floor(Math.random()*(n*n));
      var link,node;


      for(var i = 0; i < n*n; i++){
        nodes.push({ x:   (i%n)*width/n, y: Math.floor(i/n)*height/n, value:1,t:0 })
      }

      for(var i = 0; i < 1.1*n*n; i++){
        links.push({ source: Math.floor(Math.random()*(n*n)), target: Math.floor(Math.random()*(n*n))})
      }



      link = svg.selectAll('.link')
          .data(links)
          .enter().append('line')
          .attr('class', 'link')
          .attr("stroke-width", 2)
          .attr("stroke", "black");


      node = svg.selectAll('.node')
          .data(nodes)
          .enter().append('circle')
          .attr('class', 'node')
          .attr("r", 8)
          .attr("fill", function(d) { return color(1); });

    var force = d3.layout.force()
        .size([width, height])
        .linkStrength(1.0)
        .friction(0.9)
        .linkDistance(30)
        .charge(-50)
        .gravity(0.1)
        .theta(0.8)
        .alpha(0.1)
        .nodes(nodes)
        .links(links);

      var animationStep = 20;
      force.on('tick', function() {
        if(Math.random()<1.0){
          t ++;
          mynode = transitionNode(mynode,links);

          node.attr('r',function (d, i) {
                                       if (i == mynode) {d.value += Math.exp(-t/500)}
                                          return d.value

                                      });

        }

        var driftColor = d3.scale.linear().domain([0,50])
          .range([blue, red]);

        node.transition().ease('linear').duration(animationStep)
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; })
            .style('fill',function(d,i){
              /*  if(mynode==i){
                  return blue;
                } else {
                  return red;
                }*/
                d.t = (mynode==i)? 0:d.t+1;
                return driftColor(d.t)
             })
             .style("stroke-width", function(d,i){return (mynode==i)? 5:0})
             .style("stroke", blue)


        link.transition().ease('linear').duration(animationStep)
            .attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });


        force.stop();


            setTimeout(
                function() { if(!pause){force.start();} },
                animationStep
            );


    });

    d3.select("#network-play").on('click',function(d){
      pause = !pause;
      force.start();
    });
    //start network forces.
    force.start();
    }


  initialiseNetwork();



  d3.select("#network-reset").on('click',function(d){
    d3.select("#network-example").select("svg").selectAll("*").remove();
    initialiseNetwork();
  });




}

function cerealProcess(){


  var width = d3.select('#cereal-toy-example').node().getBoundingClientRect().width*0.75,
      height = width;
  var blue = "#66bd63";
  var red = "#f46d43";
  var colors = ["#C23052","#D85819","#EEAE03","#67A210","#364080"];
  var pause = false;
  var toys = [];
  var cereal_bought = 0; //count total number of cereal boxes.



  var x = d3.scale.linear()
      .domain([-1,1])
      .range([0, width]);

  var y = d3.scale.linear()
      .domain([-1,1])
      .range([0, height]);

  var svg = d3.select("#cereal-toy-example").append("svg:svg")
      .attr("width", width)
      .attr("height", height)
      .style("display", "block")
      .style("margin","auto");

  svg.append("defs")
  .append("marker")
    .attr("id", "arrow")
    .attr("orient", "auto")
    .attr("preserveAspectRatio", "none")
    // See also http://www.w3.org/TR/SVG/coords.html#ViewBoxAttribute
    //.attr("viewBox", "0 -" + arrowWidth + " 10 " + (2 * arrowWidth))
    .attr("viewBox", "0 -5 10 10")
    // See also http://www.w3.org/TR/SVG/painting.html#MarkerElementRefXAttribute
    .attr("refX", 10)
    .attr("refY", 0)
    .attr("markerWidth", 5)
    .attr("markerHeight", 5)
  .append("path")
    .attr("d", "M0,-5L10,0L0,5");



  function boxPlacement(i){
    return 1.8*(i/5)-0.9
  }

  function boxPlacementDel(i){
    return 1.8*(i/5)-0.8
  }
  circles = []
  for (var i = 0; i < 5; i++){
    circles.push({x:x(boxPlacement(i)),y:y(-0.75),
                  r:x(-0.9), heads: true, i: i
                });
  }

  squares = []
  lines = []
  for (var i=0; i < 5; i++){
    squares.push({x:x(boxPlacementDel(i)), y:y(0.8),
                  width:x(-0.9),value: 0, i: i});
    lines.push({x1:x(boxPlacementDel(i))+x(-0.9), x2:x(boxPlacementDel(i+1)),
                y:y(0.8)+0.5*x(-0.9), i: i});
  }
  lines.pop(); //remove last element in lines.

  var current_toy = svg.append("circle")
                    .attr("id","current-toy")
                    .attr("cx", x(-0.0))
                    .attr("cy", y(0.0))
                    .attr("r",x(-0.9));
  //set up labels

  svg.append("text")
    .attr("dx", x(-0.15))
    .attr("dy", y(-0.12))
    .text("Current toy");

  svg.append("text")
    .attr("dx", x(-0.25))
    .attr("dy", y(-0.9))
    .style("font-size","18px")
    .text("Toy collection");



  var cereal_counter = svg.append("text")
                          .attr("dx", x(-0.4))
                          .attr("dy", y(0.25))
                          .style("font-size","18px")
                          .text("Cereal boxes bought: 0");

  svg.selectAll("circle")
    .data(circles)
    .enter().append("svg:circle")
    .attr("class","cereal-collection")
    .attr("cx",function(d,i){return d.x})
    .attr("cy",function(d,i){return d.y})
    .attr("r",function(d,i){return d.r})
    .attr("visibility", "hidden")
    .attr("fill",function(d,i){return colors[i]})
    .attr("id",function(d,i){return "toy-"+i});

 svg.selectAll(".textLabel")
    .data(squares)
    .enter()
    .append("text")
    .attr("x", function(d,i){return d.x})
    .attr("y", function(d,i){return d.y})
    .style("font-size","18px")
    .text(function(d,i){return i});

 var markov_states = svg.selectAll(".markov-states")
    .data(squares)
    .enter()
    .append("rect")
    .attr("class","markov-states")
    .attr("x", function(d,i){return d.x})
    .attr("y", function(d,i){return d.y})
    .attr("width", function(d,i){return d.width})
    .attr("height", function(d,i){return d.width})
    .style("fill", function(d,i) {
            if (i==0){
               return blue;
            }else{
               return red;
            }
    });
  svg.selectAll("line")
       .data(lines)
       .enter()
       .append("line")
       .attr("class","arrow")
       .attr("x1",function(d,i){return d.x1})
       .attr("x2",function(d,i){return d.x2})
       .attr("y1",function(d,i){return d.y})
       .attr("y2",function(d,i){return d.y})
       .attr("marker-end", function(d) { return "url(#arrow)" })
       .attr("stroke-width", 2)
       .attr("stroke", "black");

   var toy_collection_border = svg.append("rect")
     .attr("x", x(-0.75))
     .attr("y", y(-0.85))
     .attr("height", x(-0.8))
     .attr("width", x(0.5))
     .style("stroke", 'black')
     .style("fill", "none")
     .style("stroke-width", 1);

   function updateLayout(){
     svg.selectAll(".cereal-collection")
        .attr("visibility",function(d,i){
          return (toys.indexOf(i+1) == -1) ? "hidden":"visible"
        });
        //if not then add toy by making circle visible and add to toys
        //move along on in Markov Chain


    markov_states
       .style("fill",function(d,i){
         if (toys.length==(i)){
           return blue;
         }else{
           return red;
         }
       });
    cereal_counter.text(function(){return "Cereal boxes bought: "+ cereal_bought});
   }

   function buyCereal() {

          if (!pause){
            //random number between 0 and 3
            cereal_bought+=1;
            var newtoyi = 1 + Math.floor(Math.random() * (4));
            //update circle to show which toy is in packet.
            current_toy.attr("fill",function(){return colors[newtoyi]});
            //check if random number is in toys in possession
            if(toys.indexOf(newtoyi) == -1){
              toys.push(newtoyi);

              //d3.select('#toy-'+newtoyi).attr("visibility", "visible");
            }
            //if collected all toys return true
            return toys.length>3;
          }
   }

  d3.select("#reset-cereal").on("click", function(){
    toys = [];
    cereal_bought = 0;
    updateLayout();
  });

  d3.select("#buy-cereal").on("click", function() {
    buyCereal();
    updateLayout();
  });
}



function multipleCereal(){
  var m1 = 0,
      m2=0,
      n = 0;
  function simulateCerealBuying(){
    var n_toys = 0,
    num_cereals = 0,
    probs = [1,0.75,0.5,0.25,0.];

    while(n_toys<4){
      if(Math.random()<probs[n_toys]){
        n_toys++;
      }
      num_cereals++;
    }
    return num_cereals;
  }

  function clickBuyCereals(){
    var num_cereals = simulateCerealBuying();
    if(data[num_cereals]){ data[num_cereals]++; } else {data[num_cereals]=1;}
    var new_data = [];
    m1 += num_cereals;
    m2 += Math.pow(num_cereals,2);
    n ++;
    var variance = (m2 - Math.pow(m1,2)/n)/n;
    var mean = (m1/n);
    data.forEach(function(d,i){ new_data.push({letter: i,frequency:d})});
    stat_counter.text('Mean : '+mean.toFixed(2) + ', Variance: '+variance.toFixed(2));
    plotBarChart(new_data);
  }

  function resetCereals(){
    data = [];
    var new_data = [];
    data.forEach(function(d,i){ new_data.push({letter: i,frequency:d})});
    stat_counter.text('');
    plotBarChart(new_data);
  }
  var width = d3.select('#cereal-multiple').node().getBoundingClientRect().width*0.75,
      height = width;
  var svg = d3.select("#cereal-multiple").append("svg:svg"),
      margin = {top: 0.1*width, right: 0.1*width, bottom: 0.1*width, left: 0.15*width};

  var data = [];

  function plotBarChart(data){
    x.domain(data.map(function(d) { return d.letter; }));
    y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

    // another g element, this time to move the origin to the bottom of the svg element
    // someSelection.call(thing) is roughly equivalent to thing(someSelection[i])
    //   for everything in the selection\
    // the end result is g populated with text and lines!
    svg.select('.x.axis').transition().duration(300).call(xAxis);

    // same for yAxis but with more transform and a title
    svg.select(".y.axis").transition().duration(300).call(yAxis)

    // THIS IS THE ACTUAL WORK!
    var bars = svg.selectAll(".bar").data(data, function(d) { return d.letter; }) // (data) is an array/iterable thing, second argument is an ID generator function

    bars.exit()
      .transition()
        .duration(300)
      .attr("y", y(0))
      .attr("height", 9*height/10 - y(0))
      .style('fill-opacity', 1e-6)
      .remove();

    // data that needs DOM = enter() (a set/selection, not an event!)
    bars.enter().append("rect")
      .style("fill", red)
      .attr("class", "bar")
      .attr("y", y(0))
      .attr("height", 9*height/10 - y(0));

    // the "UPDATE" set:
    bars.transition().duration(300).attr("x", function(d) { return x(d.letter); }) // (d) is one item from the data array, x is the scale object from above
      .attr("width", x.rangeBand()) // constant, so no callback function(d) here
      .attr("y", function(d) { return y(d.frequency); })
      .attr("height", function(d) { return 9*height/10 - y(d.frequency); }); // flip the height, because y's
  }

  d3.select('#buy-cereals').on('click',clickBuyCereals);

  d3.select('#reset-cereals').on('click',resetCereals);


        var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

        var y = d3.scale.linear().range([9*height/10, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");


        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10);


            svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");



          x.domain(data.map(function(d) { return d.letter; }));
          y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

          svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + 9*height/10 + ")")
              .call(xAxis)
            .selectAll("text")
              .style("text-anchor", "end")
              .attr("dx", "-.8em")
              .attr("dy", "-.55em")
              .attr("transform", "rotate(-90)" )
            .append("text")
             .text("Number of boxes bought");

          svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Frequency");

          svg.selectAll("bar")
              .data(data)
            .enter().append("rect")
              .style("fill", "steelblue")
              .attr("x", function(d) { return x(d.letter); })
              .attr("width", x.rangeBand())
              .attr("y", function(d) { return 9*y(d.frequency)/10; })
              .attr("height", function(d) { return 9*(height - y(d.frequency))/10; });

         var stat_counter = svg.append("text")
                               .attr("x", function(){return width/3})
                               .attr("y", function(){ return height})
                               .style("font-size","18px")
                               .text("Mean: 0, variance: 0");



}

$('#prob-walker').slider({})
.on('change',function(slideEvt){
  $('#prob-walker-value').data("value", slideEvt.value.newValue);
});

window.onload = function () {
  cerealProcess();
  networkProcess();
  multipleCereal();
  simpleWalker();
  graphingWalker('#graphing-walker-example','#walker-run','#walker-reset',false);
  graphingWalker('#graphing-drift-walker-example','#drift-walker-run',
                 '#drift-walker-reset',true);
}
