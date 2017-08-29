

var w = d3.select('#lattice-epidemic-tool').node().getBoundingClientRect().width/2,
    h = w,
    eps = 0.01,
    N = 20;
var blue = d3.rgb(100,100,200),
    red = d3.rgb(200,100,100),
    //green = d3.rgb(100,200,100);
    green = d3.rgb(200,200,200);
var grid = d3.layout.grid()
  .nodeSize([h*0.8/(N*2), h*0.8/(N*2)])
  .padding([h*0.8/(N*2), h*0.8/(N*2)]);
var beta = eps*2,
    gamma = eps*1;

var nodes = [];
var force,root,svg,button;
var pause = false;

var traceS = {
  x: [],
  y: [],
  name: 'Susceptible',
  type: 'scatter'
};

var traceI = {
  x: [],
  y: [],
  name: 'Infected',
  type: 'scatter'
};
var t = 0;
var data = [traceS, traceI];

function resetGraph(){
  traceS = {
    x: [],
    y: [],
    name: 'Susceptible',
    type: 'scatter'
  };
  traceI = {
    x: [],
    y: [],
    name: 'Infected',
    type: 'scatter'
  };
  t = 0;
  data = [traceS, traceI];
  Plotly.newPlot('latticeGraphDiv', data);
}

Plotly.newPlot('latticeGraphDiv', data);

function startSim(){
  pause = false;
  resetGraph();
  d3.select("svg").remove();
  svg = d3.select("#latticeEpidemic").append("svg:svg")
      .attr("width", w)
      .attr("height", h);



  nodes = d3.range(N*N).map(function() { return {radius: h*0.8/(N*2), infected: Math.random()<0.01, immune:false}; });





      svg.selectAll("circle")
          .data(grid(nodes), function(d) { return d.id; })
        .enter().append("svg:circle")
          .attr("transform", function(d) { return "translate(" + (d.x+w/20) + "," + (d.y+h/20) + ")"; })
          .attr("r", function(d) { return d.radius; })
          .attr("id",function(d,i) {return 'individual-'+i;})
          .style("fill", function(d, i) { return blue; })
          .on("click", function(d,i){

                     d.radius=20;
                     d3.select(this).attr('stroke','black');
                     //d3.select(this).attr('fill','green');
                     nodes[i].immune = true;

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

    Plotly.newPlot('latticeGraphDiv', data);




}

$('#pause').on('click',function(){
  pause = !pause;
});
$('#reset').on('click',startSim);
startSim();


latticeNeighbors = function(ind,N){
  /*
  Takes in index and calculates where in the lattice it is
  2. calculates its neighbors.
     - first calculate left,right,up,down
     - next check if these are outside the boundary if so discard.
  3. converts these neighbors back into a lattice form.
  lattice indexes 0,...,N-1 by 0,...,N-1
  */
  var i = Math.floor(ind/N), j = (ind%N);
  neighbors =[];
  if (i-1>=0){ neighbors.push([i-1,j]); } //left
  if (i+1<N){  neighbors.push([i+1,j]); }//right
  if (j+1<N){  neighbors.push([i,j+1]); } //up
  if (j-1>=0){ neighbors.push([i,j-1]); } //down
  neighbors.map(function(item,index){ //convert back into index.
    return N*item[0] + item[1];
  });
  return neighbors;
}
indNeighbors = function(ind,N){
  var inds = latticeNeighbors(ind,N).map(function(item,index){ //convert back into index.
                                            return N*item[0] + item[1];
                                          });
  return inds
}




/*Run simulation of epidemic every second. */
setInterval(function () {
  if(!pause){
    var i = 0,
        n = nodes.length,
        I = 0,
        S = 0;
    for(var j = 0; j<n; j++){
      I += nodes[j].infected & !nodes[j].immune;
      S += !nodes[j].infected & !nodes[j].immune;
    }
    t += eps;
    if(!(I==0 || S ==0)){
      data[0].x.push(t); data[0].y.push(S);
      data[1].x.push(t); data[1].y.push(I);
      Plotly.redraw('latticeGraphDiv');
    }
    for(i = 0; i<n; i++){
      if(nodes[i].infected){

        var neighbors = indNeighbors(i,N);
        for(var ni = 0; ni<neighbors.length; ni++){
          if (Math.random()<beta & !nodes[neighbors[ni]].immune){
            nodes[neighbors[ni]].infected = true;
            /*
            d3.select( '#individual-' + neighbors[ni] ).transition()
					.duration(2)
					.attr("r", 1.2*nodes[neighbors[ni]].radius);
          */

          }
        }

        if (Math.random()<gamma){
          nodes[i].infected = false;
          nodes[i].immune = true;
          /*
          d3.select( '#individual-' + i ).transition()
        .duration(2)
        .attr("r", nodes[i].radius);
        */
        }

      }
    }
    svg.selectAll("circle").style("fill", function(d,i) {
                                                          var col = blue;
                                                          if (nodes[i].infected & !nodes.immune ){
                                                            col = red;
                                                          }
                                                          if(nodes[i].immune){
                                                            col = green;
                                                          }
                                                          return col;
                                                        });

    if(I == 0 || S == 0){

      button.style("visibility", "visible");


    }
  }
}, 100);

$('#ex1').slider({
	formatter: function(value) {
		return 'Current value: ' + value;
	}
}).on('slide',function(oldSlideEvt,slideEvt){
  beta = oldSlideEvt.value*gamma/4;
});

$('#ex2').slider({
	formatter: function(value) {
		return 'Current value: ' + value;
	}
}).on('slide',function(oldSlideEvt,slideEvt){
  eps = oldSlideEvt.value;
  var R = 4*beta/gamma;
  beta = R*eps;
  gamma = eps;
});
