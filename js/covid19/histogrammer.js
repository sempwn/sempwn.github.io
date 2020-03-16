


function outbreak_historgram(div,div_input,r0){
    //special functions
    var poisson = function(mean){
        var L = Math.exp(-mean);
        var p = 1.0;
        var k = 0;

        do {
            k++;
            p *= Math.random();
        } while (p > L);

        return (k - 1);

    }

    var bernoulli = function(p){
        return(Math.random() < p)
    }

    var outbreak_simulation = function(r0,generations){
        var sim_generation = function(xs){
            // xs - number in previous generation
            if (xs == 0){
                return 0;
            } else {
                var ns = 0;
                for(var i=0;i<xs;i++){
                    ns += poisson(r0);
                }
            }
            return(ns);
        }
        // set initial outbreak size
        var x_prev = 1;
        var n = x_prev;
        //simulate each generation to maximum number of generations
        for(i=0;i<generations;i++){
            x_prev = sim_generation(x_prev);
            n += x_prev;
        }
        return(x_prev);
    }


    var color = "steelblue";
    var dur_ms = 200;


    // Generate a 10 data points using outbreak simulation
    var values = d3.range(10).map(function(x){return outbreak_simulation(r0, 3)});

    // A formatter for counts.
    var formatCount = d3.format(",.0f");

    var width = d3.select(div).node().getBoundingClientRect().width,
        height = 0.5*width,
        margin = {top: 20, right: 30, bottom: 30, left: 40};

    // var margin = {top: 20, right: 30, bottom: 30, left: 30},
    //     width = 960 - margin.left - margin.right,
    //     height = 500 - margin.top - margin.bottom;

    var max = d3.max(values);
    var min = d3.min(values);
    var x = d3.scale.linear()
          .domain([0, 100])
          .range([0, width]);

    // Generate a histogram using twenty uniformly-spaced bins.
    var data = d3.layout.histogram()
        .bins(x.ticks(100))
        (values);

    var yMax = d3.max(data, function(d){return d.length});
    var yMin = d3.min(data, function(d){return d.length});
    var colorScale = d3.scale.linear()
                .domain([yMin, yMax])
                .range([d3.rgb(color).brighter(), d3.rgb(color).darker()]);

    var y = d3.scale.linear()
        .domain([0, yMax])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(function(d, i) {
            if(d!="100"){
                return d;
            }else{
                return ">100";
            }

        });

    var svg = d3.select(div).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bar = svg.selectAll(".bar")
        .data(data)
      .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", (x(data[0].dx) - x(0)) - 1)
        .attr("height", function(d) { return height - y(d.y); })
        .attr("fill", function(d) { return colorScale(d.y) });

    // bar.append("text")
    //     .attr("dy", ".75em")
    //     .attr("y", -12)
    //     .attr("x", (x(data[0].dx) - x(0)) / 2)
    //     .attr("text-anchor", "middle")
    //     .text(function(d) { return formatCount(d.y); });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    // Add title
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 + (margin.top)/2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Distribution of simulated outbreaks");
    /*
    * Adding refresh method to reload new data
    */
    function refresh_histogram(values){
      // var values = d3.range(1000).map(d3.random.normal(20, 5));
      var data = d3.layout.histogram()
        .bins(x.ticks(100))
        (values);

      // Reset y domain using new data
      var yMax = d3.max(data, function(d){return d.length});
      var yMin = d3.min(data, function(d){return d.length});
      y.domain([0, yMax]);

      // Reset x domain using new Data
      //var max = d3.max(values);
      //var min = d3.min(values);
      //x.domain([min, max]);

      var colorScale = d3.scale.linear()
                  .domain([yMin, yMax])
                  .range([d3.rgb(color).brighter(), d3.rgb(color).darker()]);

      var bar = svg.selectAll(".bar").data(data);

      // Remove object with data
      bar.exit().remove();

      bar.transition()
        .duration(dur_ms)
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

      bar.select("rect")
          .transition()
          .duration(dur_ms)
          .attr("height", function(d) { return height - y(d.y); })
          .attr("fill", function(d) { return colorScale(d.y) });

      // bar.select("text")
      //     .transition()
      //     .duration(dur_ms)
      //     .text(function(d) { return formatCount(d.y); });

    }

    // Calling refresh repeatedly.
    setInterval(function() {
      if(values.length < 10000){
          values = values.concat(d3.range(100).map(
              function(x){
                  return outbreak_simulation(r0, 3);
              }))
          refresh_histogram(values);
    }
    }, dur_ms);

    // update r0 on change in slider
    document.getElementById(div_input).oninput = function() {
      $('#'+div_input+"-label").text('R0: '+(this.value/100).toFixed(2));
      r0 = this.value/100;
      values = d3.range(10).map(function(x){return outbreak_simulation(r0, 3)});
    }

    //Line chart mouse over
    var mlistener = svg.append('svg:rect')
        .attr('width', width) // the whole width of g/svg
        .attr('height', height) // the whole heigh of g/svg
        .attr('fill', 'none')
        .attr('pointer-events', 'all');

    var vertical = svg
      .append("path")
      .attr("class", "remove").style({stroke:'#000', 'stroke-width': '1px', 'pointer-events': 'none'});

      var vertical_text = svg
                       .append("text")
                       .text("");

    mlistener.on("mousemove", function(){
       mousex = d3.mouse(this);
       vertical.style("display", null).attr("d", function () {
       var d = "M" + mousex[0] + "," + (height);
       d += " " + mousex[0] + "," + 0;
       return d;
    });

    vertical_text
        .style("display", null)
        .style("opacity",1)
        .attr("x", mousex[0]+10)
        .attr("y", mousex[1]+10)
        .text(function(){
            var osize = x.invert(mousex[0]);
            var prob = values.map(function(n){return n> osize})
                .reduce((previous, current) => current += previous);
                var prob = 100*prob/values.length;
                return("Prob. of outbreak greater\n than "+osize.toFixed(0) + " is " + prob.toFixed(0)+"%")
            }());

    }).on("mouseout", function(){
       mousex = d3.mouse(this);
       mousex = mousex[0] + 5;
       vertical.style("display", "none");
       vertical_text.style("display", "none")
        .style("opacity",0);
   });


}

var div = "#outbreak-simulation";
var r0 = 2.5;
var div_input = "input-outbreakr0";
outbreak_historgram(div,div_input,r0);
