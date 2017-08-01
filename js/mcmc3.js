var blue = "#66bd63";
var red = "#f46d43";


class ProbDist{

    static gamma(z) {
        var g = 7;
        var C = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
                 771.32342877765313, -176.61502916214059, 12.507343278686905,
                 -0.13857109526572012, 9.9843695780195716e-6,
                 1.5056327351493116e-7];

        if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * this.gamma(1 - z));
        else {
            z -= 1;

            var x = C[0];
            for (var i = 1; i < g + 2; i++)
            x += C[i] / (z + i);

            var t = z + g + 0.5;
            return Math.sqrt(2 * Math.PI) * Math.pow(t, (z + 0.5)) * Math.exp(-t) * x;
        }
    }

    static binomial(x,p,n) {
        return this.gamma(n+1)/( this.gamma(x+1) * this.gamma(n-x + 1) ) *
               Math.pow(p,x) * Math.pow(1-p,n-x);
    }

    static beta(x,a,b) {
        return this.gamma(a+b)/( this.gamma(a) * this.gamma(b) ) *
        Math.pow(x,a-1) * Math.pow(1-x,b-1);
    }
}

function probGraph(){
    var coins = [1,0,1,0,1,0,1,0,1,0];

    var prior_coins = [1,0,1,0,1,0,1,0,1,0];

    function graphCoins(Div,coins){
        var width = d3.select(Div).node().getBoundingClientRect().width,
            height = 0.1*width;


        var svg = d3.select(Div).append("svg:svg")
                                            .attr("width",width)
                                            .attr("height",height);
        var x = d3.scaleLinear()
                  .domain([0, 1.1])
                  .range([0, width]);

        var y = d3.scaleLinear()
                  .domain([0,1])
                  .range([0, height]);

        function update(coins) {

            // DATA JOIN
            // Join new data with old elements, if any.
          svg.selectAll("circle").remove();
          var circle = svg.selectAll("circle")
              .data(coins, function(d) { return d; });



            // UPDATE
            // Update old elements as needed.
            /*
            circle.attr("fill",function(d) {return (d==0)? blue:red; })
                .on('click',function(d,i){
                    coins[i] = 1 - coins[i];
                    svg.selectAll("circle").transition(100)
                                          .style("fill", function(d,i) {return (coins[i]==0)? blue:red; });
                    plotPriorPost();
                });
                */

            // ENTER
            // Create new elements as needed.
            //
            // ENTER + UPDATE
            // After merging the entered elements with the update selection,
            // apply operations to both.
            circle.enter().append("circle")
                .attr("cy", y(0.5))
                .attr("cx", function(d, i) { return x(1/(coins.length+1)) + x(i/(coins.length+1)); })
                .attr("r", function(d) { return Math.min(x(1/(2*(coins.length+1))), y(0.5)); })
                .attr("fill",function(d) {return (d==0)? blue:red; })
                .on('click',function(d,i){
                    coins[i] = 1 - coins[i];
                    svg.selectAll("circle").transition(100)
                                          .style("fill", function(d,i) {return (coins[i]==0)? blue:red; });
                    plotPriorPost();
                });




            // EXIT
            // Remove old elements as needed.
            /*
            circle.exit().remove();
            */
          }

        var circle = svg.selectAll("circle")
            .data(coins, function(d) { return d; });

        circle.enter().append("circle")
            .attr("cy", y(0.5))
            .attr("cx", function(d, i) { return x(1/(coins.length+1)) + x(i/(coins.length+1)); })
            .attr("r", function(d) { return Math.min(x(1/(2*(coins.length+1))), y(0.5)); })
            .attr("fill",function(d) {return (d==0)? blue:red; })
            .on('click',function(d,i){
                coins[i] = 1 - coins[i];
                svg.selectAll("circle").transition(100)
                                      .style("fill", function(d,i) {return (coins[i]==0)? blue:red; });
                plotPriorPost();
            });
        svg.append("text")
            .attr("id","probText")
            .attr("x", function(d,i){return x(1.0)})
            .attr("y", function(d,i){return y(0.3)})
            .style("font-size","24px")
            .style("cursor", "pointer")
            .text('+')
            .on('click',function(d){ coins.push(1);
                                     update(coins);
                                     plotPriorPost();
                                   });

            svg.append("text")
            .attr("id","probText")
            .attr("x", function(d,i){return x(1.0)})
            .attr("y", function(d,i){return y(0.6)})
            .style("font-size","30px")
            .style("cursor", "pointer")
            .text('-')
            .on('click',function(d){ coins.pop();
                                     update(coins);
                                     plotPriorPost();
                                   });
    }

    function plotPriorPost(){
        var px = [];
        var py = [];
        var posty = [];

        var a = 0;
        var b = 0;
        var datax = 0;
        var datan = coins.length;
        for (var i=0; i< prior_coins.length; i++){
            a += (prior_coins[i]==1);
            b += (prior_coins[i]==0);

        }

        for (var i=0; i<coins.length; i++){
            datax += (coins[i]==1);
        }

        for (var i=0; i<100; i++){
            var x = i/100;
            var y = ProbDist.beta(x,a,b);
            var yy = ProbDist.beta(x,datax+a,datan-datax+b);
            px.push(x);
            py.push(y);
            posty.push(yy);
        }

        var d = {x:px,y:py,posty:posty};

        var trace1 = {
          x: d.x,
          y: d.y,
          type: 'scatter',
          name: 'Prior'
        };

        var trace2 = {
          x: d.x,
          y: d.posty,
          type: 'scatter',
          name: 'Posterior'
        };

        var data = [trace1,trace2];

        var layout = { //main layout format for plot.ly chart
          autosize: true,
          showlegend: true,
          title: 'Prior Posterior Comparison',
          hovermode: 'closest',
          textposition: 'top right',
          xaxis: {
            title: 'Probability of heads',
            showgrid: true,
            zeroline: false
          },
          yaxis: {
            title: 'Probability',
            showline: false,
            rangemode: 'tozero',
            autorange: true,
            zeroline: true
          }
        };

        Plotly.newPlot('prob-graph', data, layout);
    }

    graphCoins('#data-circles',coins);
    graphCoins('#prior-circles',prior_coins);
    plotPriorPost();

}

function sankeyGraph(div_id){
    d3.select(div_id).selectAll("svg").remove();

    var graph = {
                    "nodes":[
                    {"node":0,"name":"test +ve"},
                    {"node":1,"name":"test -ve"},
                    {"node":2,"name":"+ve"},
                    {"node":3,"name":"-ve"}
                    ],
                    "links":[
                    {"source":0,"target":2,"value":80},
                    {"source":1,"target":3,"value":20},
                    {"source":0,"target":3,"value":60},
                    {"source":1,"target":2,"value":40}
                    ]
                };
        var br          = $('#base-rate-value').data('value');
        var sensitivity = $('#sensitivity-value').data('value');
        var specificity = $('#specificity-value').data('value');
        var pp = sensitivity*br/(sensitivity*br + (1-specificity)*(1-br));
        var np = 1-pp;
        var nn = specificity*(1-br)/(specificity*(1-br)+(1-sensitivity)*br);
        var pn = 1-nn;
        var testp = sensitivity*br + (1-specificity)*(1-br);
        var testn = specificity*(1-br) + (1-sensitivity)*br;
        var ptop = pp*testp;
        var pton = np*testp;
        var nton = nn*testn;
        var ntop = pn*testn;

        graph["links"] = [
        {"source":0,"target":2,"value":1000*ptop},
        {"source":1,"target":3,"value":1000*nton},
        {"source":0,"target":3,"value":1000*pton},
        {"source":1,"target":2,"value":1000*ntop}
        ];

                var units = "people";

                // set the dimensions and margins of the graph
                var margin = {top: 10, right: 10, bottom: 10, left: 10},
                    width = d3.select(div_id).node().getBoundingClientRect().width,
                    height = 0.3*width;
                    width = width - margin.left - margin.right;
                    height = height - margin.top - margin.bottom;

                // format variables
                var formatNumber = d3.format(",.0f"),    // zero decimal places
                    format = function(d) { return formatNumber(d) + " " + units; },
                    color = d3.scaleOrdinal(d3.schemeCategory20);

                // append the svg object to the body of the page
                var svg = d3.select(div_id).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                    .attr("transform",
                          "translate(" + margin.left + "," + margin.top + ")");

                // Set the sankey diagram properties
                var sankey = d3.sankey()
                    .nodeWidth(36)
                    .nodePadding(40)
                    .size([width, height]);

                var path = sankey.link();

                  sankey
                      .nodes(graph.nodes)
                      .links(graph.links)
                      .layout(32);

                // add in the links
                  var link = svg.append("g").selectAll(".link")
                      .data(graph.links)
                    .enter().append("path")
                      .attr("class", "link")
                      .attr("d", path)
                      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
                      .sort(function(a, b) { return b.dy - a.dy; });

                // add the link titles
                  link.append("title")
                        .text(function(d) {
                    		return d.source.name + " → " +
                                d.target.name + "\n" + format(d.value); });

                // add in the nodes
                  var node = svg.append("g").selectAll(".node")
                      .data(graph.nodes)
                    .enter().append("g")
                      .attr("class", "node")
                      .attr("transform", function(d) {
                		  return "translate(" + d.x + "," + d.y + ")"; })
                      .call(d3.drag()
                        .subject(function(d) {
                          return d;
                        })
                        .on("start", function() {
                          this.parentNode.appendChild(this);
                        })
                        .on("drag", dragmove));

                // add the rectangles for the nodes
                  node.append("rect")
                      .attr("height", function(d) { return d.dy; })
                      .attr("width", sankey.nodeWidth())
                      .style("fill", function(d) {
                		  return d.color = color(d.name.replace(/ .*/, "")); })
                      .style("stroke", function(d) {
                		  return d3.rgb(d.color).darker(2); })
                    .append("title")
                      .text(function(d) {
                		  return d.name + "\n" + format(d.value); });

                // add in the title for the nodes
                  node.append("text")
                      .attr("x", -6)
                      .attr("y", function(d) { return d.dy / 2; })
                      .attr("dy", ".35em")
                      .attr("text-anchor", "end")
                      .attr("transform", null)
                      .text(function(d) { return d.name; })
                    .filter(function(d) { return d.x < width / 2; })
                      .attr("x", 6 + sankey.nodeWidth())
                      .attr("text-anchor", "start");

                // the function for moving the nodes
                  function dragmove(d) {
                    d3.select(this)
                      .attr("transform",
                            "translate("
                               + d.x + ","
                               + (d.y = Math.max(
                                  0, Math.min(height - d.dy, d3.event.y))
                                 ) + ")");
                    sankey.relayout();
                    link.attr("d", path);
                  }




}

$('#sensitivity').slider({})
.on('change',function(slideEvt){
  $('#sensitivity-value').data("value", slideEvt.value.newValue);
  sankeyGraph('#sankey');
});

$('#specificity').slider({})
.on('change',function(slideEvt){
  $('#specificity-value').data("value", slideEvt.value.newValue);
  sankeyGraph('#sankey');
});

$('#base-rate').slider({})
.on('change',function(slideEvt){
  $('#base-rate-value').data("value", slideEvt.value.newValue);
  sankeyGraph('#sankey');
});


function sankeySecondGraph(div_id,div_id2){
    d3.select(div_id).selectAll("svg").remove();

    d3.select(div_id2).selectAll("svg").remove();

    var sets = [{sets : [0], label : 'Rain', size : 100},
                {sets : [1], label : 'Sprinklers', size: 100},
                {sets : [2], label : 'Wet', size: 100},
                {sets : [0,1] , size: 30},
                {sets : [1,2] , size: 30},
                {sets : [0,2] , size: 30},
                {sets : [0,1,2], size: 10}
                ];




    d3.select(div_id2).selectAll("path")
        .style("stroke-opacity", 0)
        .style("stroke", "#fff")
        .style("stroke-width", 3);

    d3.selectAll(div_id2 + " .venn-circle path")
        .style("fill-opacity", 0.1)
        .style("stroke-width", 10)
        .style("stroke-opacity", .5);

    d3.selectAll(div_id2 + " .venn-circle text")
        .style("font-size", "24px")
        .style("font-weight", "100");

        //var br          = $('#base-rate-value').data('value');
        //var sensitivity = $('#sensitivity-value').data('value');
        //var specificity = $('#specificity-value').data('value');
        var atob = $('#stow-value').data('value');
        var btoc = $('#rtow-value').data('value');
        var natonb = $('#rtos-value').data('value');
        var pa = $('#prob-rain-value').data('value');

        var pb = pa*atob + (1-pa)*(1-natonb);
        var pc = pa*atob*btoc + pa*(1-atob)*0 + (1-pa)*(1-natonb)*btoc +
                 (1-pa)*natonb*0;
        var pac = pa*atob*btoc;
        var pabc = btoc*atob*pa;
        var pab = pa*atob;
        var pbc = pb*btoc;

        //0- W, 1- R, 2-S, 3-NR, 4- NS, 5 - NW

        var vennd = d3.select(div_id2);
        vennd.datum([{sets : [0], label : 'Rain forecast', size : Math.round(pa*100)},
                    {sets : [1]   , label: 'Raining', size: Math.round(pb*100)},
                    {sets : [2]   , label: 'Umberella', size: Math.round(pc*100)},
                    {sets : [0,1] , label: Math.round(pab*100)+'%', size: Math.round(pab*100)},
                    {sets : [1,2] , label: Math.round(pbc*100)+'%', size: Math.round(pbc*100)},
                    {sets : [0,2] , label: Math.round(pac*100)+'%', size: Math.round((pac)*100)},
                    {sets : [0,1,2],label: Math.round(pabc*100)+'%', size: Math.round(pabc*100)}
                ]).call(venn.VennDiagram());

        vennd.selectAll("path")
            .style("stroke-opacity", 0)
            .style("stroke", "#fff")
            .style("stroke-width", 3);

        vennd.selectAll(".venn-circle path")
            .style("fill-opacity", 0.1)
            .style("stroke-width", 10)
            .style("stroke-opacity", .5);

        vennd.selectAll(".venn-circle text")
            .style("font-size", "24px")
            .style("font-weight", "100");

        vennd.selectAll(".venn-circle")
        .on("mouseover", function(d, i) {
            var node = d3.select(this).transition();
            node.select("path").style("fill-opacity", 0.5);
            node.select("text").style("font-weight", "100")
                               .style("font-size", "36px");
        })
        .on("mouseout", function(d, i) {
            var node = d3.select(this).transition();
            node.select("path").style("fill-opacity", 0.1);
            node.select("text").style("font-weight", "100")
                               .style("font-size", "24px");
        });

        vennd.selectAll(".venn-intersection")
        .style("font-size", "0px")
        .on("mouseover", function(d, i) {
            var node = d3.select(this).transition();
            node.select("path").style("fill-opacity", 0.5);
            node.select("text").style("font-weight", "100")
                               .style("font-size", "36px");

        })
        .on("mouseout", function(d, i) {
            var node = d3.select(this).transition();
            node.select("path").style("fill-opacity", 0.1);
            node.select("text").style("font-weight", "100")
                               .style("font-size", "0px");

        })
        .on("click",function (d,i){
            console.log(d);
        });




                var units = "percent";

                // set the dimensions and margins of the graph
                var margin = {top: 10, right: 10, bottom: 10, left: 10},
                    width = d3.select(div_id).node().getBoundingClientRect().width,
                    height = 0.3*width;
                    width = width - margin.left - margin.right;
                    height = height - margin.top - margin.bottom;

                // format variables
                var formatNumber = d3.format(",.0f"),    // zero decimal places
                    format = function(d) { return formatNumber(d) + " " + units; },
                    color = d3.scaleOrdinal(d3.schemeCategory20);



}

$('#prob-rain').slider({})
.on('change',function(slideEvt){
  $('#prob-rain-value').data("value", slideEvt.value.newValue);
  sankeySecondGraph('#sankey-two','#venn-two');
});

$('#rtos').slider({})
.on('change',function(slideEvt){
  $('#rtos-value').data("value", slideEvt.value.newValue);
  sankeySecondGraph('#sankey-two','#venn-two');
});

$('#rtow').slider({})
.on('change',function(slideEvt){
  $('#rtow-value').data("value", slideEvt.value.newValue);
  sankeySecondGraph('#sankey-two','#venn-two');
});

$('#stow').slider({})
.on('change',function(slideEvt){
  $('#stow-value').data("value", slideEvt.value.newValue);
  sankeySecondGraph('#sankey-two','#venn-two');
});

function probabilityVennDiagram(){

    var sets = [{sets : [0], label : 'A', size : 100},
                {sets : [1], label : 'B', size: 100},
                {sets : [0,1], size:30}
                ];

    var chart = venn.VennDiagram()
    d3.select("#venn").datum(sets).call(chart);

    d3.select("#venn").selectAll("path")
        .style("stroke-opacity", 0)
        .style("stroke", "#fff")
        .style("stroke-width", 3);

    d3.selectAll("#venn .venn-circle path")
        .style("fill-opacity", 0.1)
        .style("stroke-width", 10)
        .style("stroke-opacity", .5);

    d3.selectAll("#venn .venn-circle text")
        .style("font-size", "24px")
        .style("font-weight", "100");

    d3.selectAll("#venn .venn-circle")
    .on("mouseover", function(d, i) {
        var node = d3.select(this).transition();
        node.select("path").style("fill-opacity", 0.5);
        node.select("text").style("font-weight", "100")
                           .style("font-size", "36px");
    })
    .on("mouseout", function(d, i) {
        var node = d3.select(this).transition();
        node.select("path").style("fill-opacity", 0.1);
        node.select("text").style("font-weight", "100")
                           .style("font-size", "24px");
    });

    d3.selectAll("#venn .venn-intersection")
    .on("mouseover", function(d, i) {
        var node = d3.select(this).transition();
        node.select("path").style("fill-opacity", 0.5);
        node.select("text").style("font-weight", "100")
                           .style("font-size", "36px")
                           .text("A and B");
    })
    .on("mouseout", function(d, i) {
        var node = d3.select(this).transition();
        node.select("path").style("fill-opacity", 0.1);
        node.select("text").style("font-weight", "100")
                           .style("font-size", "24px")
                           .text("");
    });
}

function directedGraphExample(div){

        var margin = {top: 10, right: 10, bottom: 10, left: 10},
            width = d3.select(div).node().getBoundingClientRect().width,
            height = 0.3*width;
            width = width - margin.left - margin.right;
            height = height - margin.top - margin.bottom;

        var states = ['Rain forecast','Rain','Use umberella'];





            var svg = d3.select(div).append("svg:svg")
                                                .attr("width",width)
                                                .attr("height",height);
            var x = d3.scaleLinear()
                      .domain([0, 1])
                      .range([0, width]);

            var y = d3.scaleLinear()
                      .domain([0,1])
                      .range([0, height]);

              var elem = svg.selectAll("g")
                            .data(states, function(d) { return d; })

                /*Create and place the "blocks" containing the circle and the text */
                var elemEnter = elem.enter()
                    .append("g")
                    .attr("transform", function(d,i){return "translate("+
                    (x(1/(states.length+1)) + x(i/(states.length+1)))+","+
                    y(0.5)+")"})



                /*Create the circle for each block */
                var circle = elemEnter.append("circle")
                .attr("r", function(d) { return Math.min(x(1/(4*(states.length+1))), y(0.5)); })
                .attr("fill",function(d) {return  blue; })
                .on('click',function(d,i){

                });

                /* Create the text for each block */
                elemEnter.append("text")
                    .attr("text-anchor", "middle")
                    .text(function(d){return d});

                    var path = svg.append('path')
                                .attr('class', 'path');


            function trianglePath(xy1,xy2) {
              var x = xy2[0] - xy1[0];
              var y = xy2[1] - xy1[1];
              var dist = Math.sqrt(x * x + y * y);
              var angle = Math.atan2(y, x) / Math.PI * 180;
              return function () {
                this.attr('d', 'M0,0 L' + [
                  0, radius,
                  dist - radius, radius / 3,
                  dist - radius, radius,
                  dist, 0,
                  dist - radius, -radius,
                  dist - radius, -radius / 3,
                  0, -radius
                ] + 'z');
                this.attr('transform', 'translate(' + [cx, cy] + ') rotate(' + angle + ')');
              }
            }

            path.call(trianglePath(circle[0],circle[1]));

        }


window.onload = function () {
    probGraph();
    sankeyGraph('#sankey');
    sankeySecondGraph('#sankey-two','#venn-two');
    probabilityVennDiagram();
    //directedGraphExample('#BN-diagram');


    console.log(ProbDist.gamma(1));
}
