var params = {R0: 2, gamma: 1/3, S: 10000, I: 1, R: 0};
var sparams = {R0: 2, gamma: 1/3, S: 10000, I: 1, R: 0};;
var maxT = 100; //100 days
var nreps = 20; //number of replicates.

poisson = function(mean){
    var L = Math.exp(-mean);
    var p = 1.0;
    var k = 0;

    do {
        k++;
        p *= Math.random();
    } while (p > L);

    return (k - 1);

}

simpleSIR = function(params,T){
  var beta = params.R0 * params.gamma;
  var gamma = params.gamma;
  var dt = 0.5;
  var S0 = params.S;
  var I0 = params.I;
  var R0 = params.R;
  var N = S0 + I0 + R0;
  var Is = [I0];
  var Ss = [S0];
  var Rs = [R0];
  var ts = [0];
  var S=S0; var I=I0; var R=R0; var t=0;
  for(var i = 0; i < T/dt; i++){
    dS = -beta*S*I/N;
    dR = gamma*I;
    dI = beta*S*I/N - gamma*I;

    S = S + dt*dS;
    R = R + dt*dR;
    I = I + dt*dI;
    t = t + dt;

    Is.push(I);
    Rs.push(R);
    Ss.push(S);
    ts.push(t);
  }
  return {S:Ss,I:Is,R:Rs,t:ts}
}

multipleStochsticSIR = function(params,T,n){
  Is = [];
  for (var i = 0; i < n; i++){
    res = simpleStochasticSIR(params,T);
    Is.push(res.I);
  }
  return {I:Is,t:res.t}
}

simpleStochasticSIR = function(sparams,T){
  var beta = sparams.R0 * sparams.gamma;
  var gamma = sparams.gamma;
  var dt = 0.5;
  var S0 = sparams.S;
  var I0 = sparams.I;
  var R0 = sparams.R;
  var N = S0 + I0 + R0;
  var Is = [I0];
  var Ss = [S0];
  var Rs = [R0];
  var ts = [0];
  var S=S0; var I=I0; var R=R0; var t=0;
  for(var i = 0; i < T/dt; i++){
    infected = poisson(dt*beta*S*I/N);
    recovered = poisson(dt*gamma*I);


    S = S - infected;
    R = R + recovered;
    I = I + infected - recovered;
    t = t + dt;

    S = (S<0)? 0:S;
    I = (I<0)? 0:I;
    R = (R<0)? 0:R;

    Is.push(I);
    Rs.push(R);
    Ss.push(S);
    ts.push(t);
  }
  return {S:Ss,I:Is,R:Rs,t:ts}
}

var w = d3.select('#lattice-epidemic-tool').node().getBoundingClientRect().width*0.75,
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







function startSim(){
  pause = false;
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


function plotGraph(div,res){
  traceS = {
    x: res.t,
    y: res.S,
    name: 'Susceptible',
    type: 'scatter'
  };
  traceI = {
    x: res.t,
    y: res.I,
    name: 'Infected',
    type: 'scatter'
  };
  data = [traceS, traceI];

  var layout = { //main layout format for plot.ly chart
    autosize: true,
    showlegend: false,
    title: 'deterministic epidemic',
    hovermode: 'closest',
    textposition: 'top right',
    xaxis: {
      title: 'time since start of epidemic (days)',
      showgrid: true,
      zeroline: false
    },
    yaxis: {
      title: 'number of individuals',
      showline: false,
      rangemode: 'tozero',
      autorange: true,
      zeroline: true
    }
  };

  Plotly.newPlot(div, data, layout);
}

function plotStochGraph(div,res){
  var data = [];
  for (i=0; i<res.I.length;i++){
    trace = {
      x: res.t,
      y: res.I[i],
      mode: 'lines',
      hoverinfo: 'none',
      type: 'scatter',
      line: {
        color: 'rgb(200, 200, 200)',
        width: 1,
        opacity: 0.8
      }
    };
    data.push(trace);
  }

  var layout = { //main layout format for plot.ly chart
    autosize: true,
    showlegend: false,
    title: 'stochastic epidemic',
    hovermode: 'closest',
    textposition: 'top right',
    xaxis: {
      title: 'time since start of epidemic (days)',
      showgrid: true,
      zeroline: false
    },
    yaxis: {
      title: 'number of individuals',
      showline: false,
      rangemode: 'tozero',
      autorange: true,
      zeroline: true
    }
  };

  Plotly.newPlot(div, data,layout);
}

$('#inputr0').slider({
	formatter: function(value) {
		return 'R0: ' + value;
	}
}).on('change', function(slideEvt){
  params.R0 = slideEvt.value.newValue;
  plotGraph('SIRGraphDiv',simpleSIR(params,maxT));
});

$('#inputgamma').slider({
	formatter: function(value) {
		return 'rate of recovery: ' + value + ' days';
	}
}).on('change',function(slideEvt){
  params.gamma = 1/slideEvt.value.newValue;
  plotGraph('SIRGraphDiv',simpleSIR(params,maxT));
});

$('#inputr0s').slider({
	formatter: function(value) {
		return 'R0: ' + value;
	}
}).on('change', function(slideEvt){
  sparams.R0 = slideEvt.value.newValue;
  plotStochGraph('StochSIRGraphDiv',multipleStochsticSIR(sparams,maxT,nreps));
});

$('#inputgammas').slider({
	formatter: function(value) {
		return 'rate of recovery: ' + value + ' days';
	}
}).on('change',function(slideEvt){
  sparams.gamma = 1/slideEvt.value.newValue;
  plotStochGraph('StochSIRGraphDiv',multipleStochsticSIR(sparams,maxT,nreps));
});

window.onload = function () {
  plotGraph('SIRGraphDiv',simpleSIR(params,maxT));
  plotStochGraph('StochSIRGraphDiv',multipleStochsticSIR(sparams,maxT,nreps));
}
