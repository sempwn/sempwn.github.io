var w = d3.select('#title-section').node().getBoundingClientRect().width,
    h = w/3,
    eps = 0.0001;
var nodes = [];
var force,root,svg,button;
var blue = d3.rgb(50,50,100),
    red = d3.rgb(100,50,50),
    green = d3.rgb(50,100,50);

function startSim(){
  d3.select("svg").remove();
  svg = d3.select("#epidemic").append("svg:svg")
      .attr("width", w)
      .attr("height", h);



  nodes = d3.range(200).map(function() { return {radius: 10, infected: Math.random()<0.01, immune:false}; });


  force = d3.layout.force()
      .gravity(0.05)
      .friction(0.8)
      .charge(function(d, i) { return i ? 0 : 0; })
      .nodes(nodes)
      .size([w, h]);

      root = nodes[0];
      root.radius = 0;
      root.fixed = true;

      force.start();

      svg.selectAll("circle")
          .data(nodes.slice(1))
        .enter().append("svg:circle")
          .attr("r", function(d) { return d.radius; })
          .style("fill", function(d, i) { return 'blue'; })
          .on("click", function(d,i){

                     d.radius=20;
                     d3.select(this).attr('stroke','black');
                     nodes[i].immune = true;
                     force.resume();
                 });
     button = svg.append('svg:text')

         .text('reset')
         .attr('width', w/10)
         .attr('height', h/10)
         .attr("transform", "translate(" + (w/2-w/40)+
         "," + (h/2) + ")")
         .style("visibility", "hidden")
         .style('fill','white')
         .attr("font-size", "20px")
         .style('cursor','pointer')
         .on('click',startSim);



    force.on("tick", function(e) {
      var q = d3.geom.quadtree(nodes),
          i = 0,
          n = nodes.length;


      while (++i < n) {
        q.visit(collide(nodes[i]));
        //if(Math.random()<0.1){ nodes[i].style('fill','red'); }
      }

      svg.selectAll("circle")
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });

    });
}

startSim();





/*Run simulation of epidemic every second. */
setInterval(function () {
  var i = 0,
      n = nodes.length,
      I = 0,
      S = 0;
  for(var j = 0; j<n; j++){
    I += nodes[j].infected & !nodes[j].immune;
    S += !nodes[j].infected & !nodes[j].immune;
  }
  for(i = 0; i<n; i++){
    if(Math.random()< (eps*I) & !nodes[i].immune){
      nodes[i].infected = true;
    }
  }
  svg.selectAll("circle").style("fill", function(d,i) { return nodes[i].infected ? 'red':'blue'; });

  if(I == 0 || S == 0){

    button.style("visibility", "visible");


  }
}, 100);

function collide(node) {
  var r = node.radius + 16,
      nx1 = node.x - r,
      nx2 = node.x + r,
      ny1 = node.y - r,
      ny2 = node.y + r;
  return function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== node)) {
      var x = node.x - quad.point.x,
          y = node.y - quad.point.y,
          l = Math.sqrt(x * x + y * y),
          r = node.radius + quad.point.radius;
      if (l < r) {
        l = (l - r) / l * .5;
        node.x -= x *= l;
        node.y -= y *= l;
        quad.point.x += x;
        quad.point.y += y;
      }
    }
    return x1 > nx2
        || x2 < nx1
        || y1 > ny2
        || y2 < ny1;
  };
}
