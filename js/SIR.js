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
}).on('slide', function(slideEvt){
  params.R0 = slideEvt.value;
  plotGraph('SIRGraphDiv',simpleSIR(params,maxT));
});

$('#inputgamma').slider({
	formatter: function(value) {
		return 'rate of recovery: ' + value + ' days';
	}
}).on('slide',function(slideEvt){
  params.gamma = 1/slideEvt.value;
  plotGraph('SIRGraphDiv',simpleSIR(params,maxT));
});

$('#inputr0s').slider({
	formatter: function(value) {
		return 'R0: ' + value;
	}
}).on('slide', function(slideEvt){
  sparams.R0 = slideEvt.value;
  plotStochGraph('StochSIRGraphDiv',multipleStochsticSIR(sparams,maxT,nreps));
});

$('#inputgammas').slider({
	formatter: function(value) {
		return 'rate of recovery: ' + value + ' days';
	}
}).on('slide',function(slideEvt){
  sparams.gamma = 1/slideEvt.value;
  plotStochGraph('StochSIRGraphDiv',multipleStochsticSIR(sparams,maxT,nreps));
});

window.onload = function () {
  plotGraph('SIRGraphDiv',simpleSIR(params,maxT));
  plotStochGraph('StochSIRGraphDiv',multipleStochsticSIR(sparams,maxT,nreps));
}
