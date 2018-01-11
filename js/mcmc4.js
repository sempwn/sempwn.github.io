
// Populate a grid of n×m values where -2 ≤ x ≤ 2 and -2 ≤ y ≤ 1.

var height = 500,width = 960;
var main_div_id = '#main-div';

var dist = new normal();
var sampler = MetropolisUpdate;
var alpha = 0.05;
var animation_speed = 100;

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

function vecAdd(v1,v2){
    //add two vectors
    return v1.map(function (num, idx) {
        return num + v2[idx];
    });
}

function vecDiv(v1,x){
    //divide v1 by scalar.
    return v1.map(function (num, idx) {
        return num/x;
    });
}


var width = d3.select(main_div_id).node().getBoundingClientRect().width;
var height = 0.5*width;

//var n = 240, m = 125, values = new Array(n * m);
var n = Math.floor(height/2), m = Math.floor(height/4), values = new Array(n * m);
var svg = d3.select(main_div_id).append("svg"),
    margin = {top: 30, right: 30, bottom: 30, left: 30};
svg.attr("width",width);
svg.attr("height",height);
width = width-margin.right-margin.left,
height = height-margin.top-margin.bottom;


var div = d3.select("body")
            .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0)
                .style("padding","2px")
                .style("border-radius","8px")
                .style("background-color","lightsteelblue")
                .style("font-size","20px");

var x = d3.scaleLinear()
    .domain([0,1])
    .range([margin.left, width]);

var y = d3.scaleLinear()
    .domain([0,1])
    .range([margin.top, height]);



var thresholds = d3.range(0, 21)
    .map(function(p) { return p/10; });

var contours = d3.contours()
    .size([n, m])
    .thresholds(thresholds);

var color = d3.scaleLinear()
    .domain(d3.extent(thresholds))
    .interpolate(function() { return d3.interpolateYlGnBu; });



/*
<div class="form-group">
  <label for="sel1">Select list:</label>
  <select class="form-control" id="sel1">
    <option>1</option>
    <option>2</option>
    <option>3</option>
    <option>4</option>
  </select>
</div>
*/
var form = d3.select(main_div_id).append("row").append("div")
                                    .attr("class",'col-md-offset-3 col-md-6')
                                        .append("div")
                                        .attr("class","form-group");
form.append("label").attr("for","sell")
                    .text("Select distribution:");
var form_select = form.append("select")
                        .attr("class","form-control")
                        .attr("id","distribution-id")
                        .on('change',function(){
                            console.log(form_select.property('value'));
                            var val = form_select.property('value');
                            var dist_kw = {'normal':normal,'bimodal':bimodal,
                                           'skew':skew,'multimodal':multimodal,
                                           'banana':banana};
                            chain = {x:[],y:[]};
                            dist = new dist_kw[val]();
                            reset(dist);

                        });
form_select.append("option").text("normal");
form_select.append("option").text("bimodal");
form_select.append("option").text("multimodal");
form_select.append("option").text("skew");
form_select.append("option").text("banana");


var form = d3.select(main_div_id).append("row").append("div")
                                    .attr("class",'col-md-offset-3 col-md-6')
                                        .append("div")
                                        .attr("class","form-group");
form.append("label").attr("for","sell")
                    .text("Select sampling scheme:");
var sampler_select = form.append("select")
                        .attr("class","form-control")
                        .attr("id","distribution-id")
                        .on('change',function(){
                            console.log(sampler_select.property('value'));
                            var val = sampler_select.property('value');
                            var update_kw = {'Metropolis-Hastings':MetropolisUpdate,'Slice':SliceUpdate,
                                           'Hamiltonian':HMCUpdate,'NUTS':MetropolisUpdate,
                                           };
                            chain = {x:[],y:[]};
                            sampler = update_kw[val];


                        });
sampler_select.append("option").text('Metropolis-Hastings');
sampler_select.append("option").text('Slice');
sampler_select.append("option").text('Hamiltonian');
//sampler_select.append("option").text('NUTS');


/*
<p>
  <label for="nRadius"
         style="display: inline-block; width: 240px; text-align: right">
         radius = <span id="nRadius-value">…</span>
  </label>
  <input type="range" min="1" max="150" id="nRadius">
</p>
*/
var makeSlider = function(div_id,text,onChange){
    var slide_div = d3.select(div_id).append("row").append("div")
                                        .attr("class",'col-md-offset-3 col-md-6');

    slide_div.append("label").attr("for","alpha")
                         .text(text);
    function slideChange(){
        onChange(slide);
    }
    var slide = slide_div.append("input").attr("type","range")
                        .attr("min","0.01")
                        .attr("max","0.2")
                        .attr("step","0.01")
                        .on("change",slideChange);
}

makeSlider(main_div_id,"Step-size",function(d){
    var val = d.property('value');
    alpha = val;
});

makeSlider(main_div_id,"Speed",function(d){
    var val = d.property('value');
    animation_speed = 210 - val*1000;
});



var reset = function(distribution){
    var w = width;
    var h = height;
    if(distribution===undefined){
        distribution = dist;
    }
    var values = new Array(n * m);

    var thresholds = d3.range(0, 21)
        .map(function(p) { return p/10; });

    var contours = d3.contours()
        .size([n, m])
        .thresholds(thresholds);

    svg.selectAll("path").remove();
    var fx = .3*margin.left/n;
        fy = .3*margin.top/m;
    for (var j = 0., k = 0; j < m; ++j) {
      for (var i = 0.; i < n; ++i, ++k) {
        values[k] = distribution.l(i/n+fx,j/m+fy);
      }
    }

    svg.selectAll("path")
      .data(contours(values))
      .enter().append("path")
        .attr("d", d3.geoPath(d3.geoIdentity().scale(w/n).translate([margin.left,margin.top])))
        .attr("fill", function(d) { return color(d.value); })
        .style("stroke", "white")
        .on("mousemove",function(d){
            var mouseVal = d3.mouse(this);

            d3.select(this).style("stroke", "black")
                           .style("stroke-width",5)
                           .style("opacity",1.0);
            div.transition()
                .duration(200)
                .style("opacity", .9);

           div.html("Likelihood:" + d.value + "(" + (mouseVal[0]/w).toFixed(2) +  ","+ (mouseVal[1]/h).toFixed(2) + ")")
           .style("left", (d3.event.pageX+10) + "px")
           .style("top", (d3.event.pageY-10) + "px");

        })
        .on("mouseout",function(){
            div.transition()
                .duration(50)
                .text("")
                .style("opacity", 0);

            d3.select(this).style("stroke", "white")
                           .style("stroke-width",1);

        });
        pwalker.moveToFront();
        walker.moveToFront();

}



var walker = svg.append("circle")
                .attr("id",'walker')
                .attr("r",10)
                .attr("cx",x(0.5))
                .attr("cy",y(0.5));
var pwalker = svg.append("circle")
                .attr("id",'pwalker')
                .attr("r",10)
                .attr("fill","red")
                .attr("cx",x(0.5))
                .attr("cy",y(0.5));

var wx = 0.25,
    wy = 0.25;
var chain = {x:[],y:[]};
reset();

svg.on("click",function(){
    mx = d3.mouse(this)[0];
    my = d3.mouse(this)[1];
    chain = {x:[],y:[]};
    wx = mx/width;
    wy = my/height;
    walker.attr("cx",mx)
          .attr("cy",my);
});

var NewHistogram = function(svg,margin,data,yaxis){
    var color = "steelblue";
    this.yaxis = yaxis;
    if(yaxis===undefined){
        yaxis = false;
    }

    var formatCount = d3.format(",.0f");
    //var svg = d3.select("#hist");
    //var margin = {top: 10, right: 30, bottom: 30, left: 30}
    var width = +svg.attr("width") - margin.left - margin.right,
        height = margin.top;
    if(yaxis){
        width = margin.right;
        height = +svg.attr("height") - margin.top - margin.bottom;
    }
    this.g = svg.append("g").attr("transform", "translate(" + 0 + "," + 0 + ")");
    if(yaxis){
        this.x = d3.scaleLinear()
            .rangeRound([height,0]);
    } else{
        this.x = d3.scaleLinear()
            .rangeRound([0, width/2]);
    }

    var bins = d3.histogram()
        .domain(this.x.domain())
        .thresholds(this.x.ticks(20))
        (data);

    if(yaxis){
        var y = d3.scaleLinear()
            .domain([0, d3.max(bins, function(d) { return d.length; })])
            .range([0,width]);
    }else{
        var y = d3.scaleLinear()
            .domain([0, d3.max(bins, function(d) { return d.length; })])
            .range([height, 0]);
    }

    if(yaxis){
        var bar = this.g.selectAll(".bar")
          .data(bins)
          .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + y(d.length) + "," + x(d.x0) + ")"; });

        bar.append("rect")
            .attr("x", 1)
            .attr("height", x(bins[0].x1) - x(bins[0].x0) - 1)
            .attr("width", function(d) { return width - y(d.length); });





    }else{
        var bar = this.g.selectAll(".bar")
          .data(bins)
          .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

        bar.append("rect")
            .attr("x", 1)
            .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
            .attr("height", function(d) { return height - y(d.length); });





    }


    /*
    * Adding refresh method to reload new data
    */
    this.refresh = function(data){
      // var values = d3.range(1000).map(d3.random.normal(20, 5));
      var bins = d3.histogram()
            .domain(this.x.domain())
            .thresholds(this.x.ticks(20))
            (data);



      var bar = this.g.selectAll(".bar").data(bins);

      // Remove object with data
      bar.exit().remove();

      if(this.yaxis){
          var y = d3.scaleLinear()
                 .domain([0, d3.max(bins, function(d) { return d.length; })])
                 .range([width, 0]);

          bar.transition()
            .duration(100)
            .attr("transform", function(d) { return "translate(" + y(d.length) + "," + x(d.x0/2) + ")"; });

          bar.select("rect")
              .transition()
              .duration(100)
              .attr("x", 1)
              .attr("height", .5*(x(bins[0].x1) - x(bins[0].x0) - 1))
              .attr("width", function(d) { return width - y(d.length); })
              .attr("fill",color);



      }else{

          var y = d3.scaleLinear()
                 .domain([0, d3.max(bins, function(d) { return d.length; })])
                 .range([height, 0]);

          bar.transition()
            .duration(100)
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

          bar.select("rect")
              .transition()
              .duration(100)
              .attr("x", 1)
              .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
              .attr("height", function(d) { return height - y(d.length); })
              .attr("fill",color);

          bar.select("text")
              .transition()
              .duration(100)
              .attr("dy", ".75em")
              .attr("y", 6)
              .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
              .attr("text-anchor", "middle")
              .attr("fill","#fff")
              .attr("font","10px")
              .text(function(d) { return formatCount(d.length); });

      }



    }
}

var xhist = new NewHistogram(svg,margin,[],false);
var yhist = new NewHistogram(svg,margin,[],true);
//var yhist = new NewHistogram(svg,margin,[],true);

var randomWalk = function(){
  var owx = wx,
  owy = wy;
  update = sampler(wx,wy);
  wx = update.x;
  wy = update.y;
  chain.x.push(wx);
  chain.y.push(wy);
  xhist.refresh(chain.x);
  yhist.refresh(chain.y);
  svg.select('#pwalker').attr('cx', x(owx))     // move the circle to 920 on the x axis
                        .attr('cy',y(owy));
  var t0 = svg.transition().duration(animation_speed);

  t0.select('#pwalker').attr('cx', x(update.px))     // move the circle to 920 on the x axis
                    .attr('cy',y(update.py));


  var t1 = t0.transition();



  t1.select('#walker')
        .attr('cx', x(wx))     // move the circle to 920 on the x axis
        .attr('cy',y(wy))    // position the circle at 250 on the y axis
        .on("end", randomWalk);  // when the transition finishes start again
/*
  pwalker.attr('alpha',1.)
  .transition()
  .duration(100)
  .attr('cx', x(update.px))     // move the circle to 920 on the x axis
  .attr('cy',y(update.py))
  .transition().duration(100).attr('alpha',0.)

  walker
  .transition()        // apply a transition
  .duration(100)      // apply it over 2000 milliseconds
  .attr('cx', x(wx))     // move the circle to 920 on the x axis
  .attr('cy',y(wy))    // position the circle at 250 on the y axis
  .on("end", randomWalk);  // when the transition finishes start again
  */


}

randomWalk();




// See https://en.wikipedia.org/wiki/Test_functions_for_optimization
function goldsteinPrice(x, y) {
  return (1 + Math.pow(x + y + 1, 2) * (19 - 14 * x + 3 * x * x - 14 * y + 6 * x * x + 3 * y * y))
      * (30 + Math.pow(2 * x - 3 * y, 2) * (18 - 32 * x + 12 * x * x + 48 * y - 36 * x * y + 27 * y * y));
}

function normal() {

    var sig = 0.2;
    this.logGrad =
        function(x,y){
            x = 2*x - 1;
            y = 2*y - 1;
            var dx = -(1/sig**2)*x;
            var dy = -(1/sig**2)*y;
            return [dx,dy];
        };
    this.l =
        function(x,y){
            x = 2*x - 1;
            y = 2*y - 1;
            var value = Math.exp(-(.5/sig**2)*(x * x + y * y));
            return value
        };

}



function bimodal(x , y) {
    var sig = 0.2;
    function norm(x,y){
        return Math.exp(-(.5/sig**2)*(x * x + y * y));
    }
    function normGrad(x,y){
        return [-(.5/sig**2)*2*x*norm(x,y),-(.5/sig**2)*2*y*norm(x,y)];
    }
    function grad(x,y){
        var v1 = normGrad(2*(x-0.2) - 1,2*(y-0.2) - 1);
        var v2 = normGrad(2*(x+0.2) - 1,2*(y+0.2) - 1);
        var value = vecAdd(v1,v2);
        return value;
    }

    this.l =
        function(x,y){
            var value = norm(2*(x-0.2) - 1,2*(y-0.2) - 1);

            value += norm(2*(x+0.2) - 1,2*(y+0.2) - 1);
            return value
        };
    this.logGrad =
            function(x,y){
                return vecDiv(grad(x,y),this.l(x,y));
            };


}

function multimodal(x , y) {
    var sig = 0.2;
    var sep = 0.2;
    function norm(x,y){
        return Math.exp(-(.5/sig**2)*(x * x + y * y));
    }
    function normGrad(x,y){
        return [-(.5/sig**2)*2*x*norm(x,y),-(.5/sig**2)*2*y*norm(x,y)];
    }
    function grad(x,y){
        var v1 = normGrad(2*(x-sep) - 1,2*(y-sep) - 1);
        var v2 = normGrad(2*(x+sep) - 1,2*(y-sep) - 1);
        var v3 = normGrad(2*(x-sep) - 1,2*(y+sep) - 1);
        var v4 = normGrad(2*(x+sep) - 1,2*(y+sep) - 1);
        var value = vecAdd(v1,v2);
        value = vecAdd(value,v3);
        value = vecAdd(value,v4);
        return value;
    }

    this.l =
        function(x,y){
            var value = norm(2*(x-sep) - 1,2*(y-sep) - 1);
            value += norm(2*(x+sep) - 1,2*(y-sep) - 1);
            value += norm(2*(x-sep) - 1,2*(y+sep) - 1);
            value += norm(2*(x+sep) - 1,2*(y+sep) - 1);
            return value
        };
    this.logGrad =
        function(x,y){
            return vecDiv(grad(x,y),this.l(x,y));
        };


}

function skew(x , y) {
    var tau = 1/(0.5*0.5);
    var rho = 0.99;
    this.logGrad =
        function(x,y){
            x = 2*x - 1;
            y = 2*y - 1;

            var dx = -(.5*tau/(1-rho*rho))*(2*x-2*rho*y);
            var dy = -(.5*tau/(1-rho*rho))*(2*y-2*rho*x);
            return [dx,dy];
        };
    this.l =
        function(x,y){
            x = 2*x - 1;
            y = 2*y - 1;
            var value = Math.exp(-(.5*tau/(1-rho*rho))*(x * x + y * y - 2* rho * x * y));
            return value
        };

}

function banana(x, y){
    this.logGrad =
        function(x,y){
            x = 2*(x+0.2) - 1;
            y = 2*(y+0.2) - 1;

            var dx = (18/4)*(0.45-x) + 48*Math.pow(x,3)*(.5*y-Math.pow(x,4));
            var dy = -6*(.5*y - Math.pow(x,4))
            return [dx,dy];
        };
    this.l =
        function(x,y){
            x = 2*(x+0.2) - 1;
            y = 2*(y+0.2) - 1;
            var value = Math.exp(-Math.pow(3*(0.45-x),2)/4 -Math.pow(6*(.5*y-Math.pow(x,4)),2));
            return value
        };

}


function MetropolisUpdate(x,y){
    l = dist.l(x, y);
    var px = x + alpha*randn_bm();
    var py = y + alpha*randn_bm();
    var pl = dist.l(px,py);
    conds = (px < 1) && (px > 0) &&
            (py < 1) && (py > 0);
    if(pl/l > 1){
        x = px;
        y = py;
        pl = l;
    }else if( (Math.random() < pl/l) && conds){
        x = px;
        y = py;
        pl = l;
    }

    return {x:x , y:y, px:px, py:py};
}

function HMCUpdate(x,y){
    var w = parseFloat(alpha),
        max_steps = 10;
    var eps = 0.01;
    l = dist.l(x, y);

    var vx = 10.*w*randn_bm();
    var vy = 10.*w*randn_bm();

    var px = x,
        py = y;

    vx = vx + (eps/2)*dist.logGrad(x,y)[0];
    vy = vy + (eps/2)*dist.logGrad(x,y)[1];
    for(var i =0; i < max_steps; i++){
        px = px + eps*vx;
        py = py + eps*vy;
        vx = vx + (eps/2)*dist.logGrad(px,py)[0];
        vy = vy + (eps/2)*dist.logGrad(px,py)[1];
    }
    conds = (px < 1) && (px > 0) &&
            (py < 1) && (py > 0);
    var pl = dist.l(px,py);
    if(pl/l > 1){
        x = px;
        y = py;
        pl = l;
    }else if( (Math.random() < pl/l) && conds){
        x = px;
        y = py;
        pl = l;
    }

    return {x:x , y:y, px:px, py:py};
}

function SliceUpdate(x,y){
    //control parameters
    function ddist(x,y){
        return dist.l(x,y)*(x>0)*(x<1)*(y>0)*(y<1);
    }
    var w = parseFloat(alpha),
        max_steps = 10,
        max_iter = 100;

    l = ddist(x, y);
    var u = randn_unif(0,l);
    var v = randn_unif(0,w);
    var L = x - v,
        R = L + w;
    //expansion step
    var J = Math.floor(max_steps*randn_unif(0,1)),
        K = (max_steps-1)-J;
    while((u<ddist(L,y)) & (J>0)){
        L = L - w;
        J = J - 1;
    }

    while((u<ddist(R,y)) & (K>0)){
        R = R + w;
        K = K - 1;
    }

    //sample and shrink
    if(L>=R){
        px = x;
    } else {
        var iter = 0;
        px = randn_unif(L,R);
        while (u>=ddist(px,y) & (iter < max_iter)){
            px = randn_unif(L,R);
            if(px>x) R = px;
            if(px<x) L = px;
            iter +=1;
        }
    }


    l = ddist(px,y);
    u = randn_unif(0,l);
    v = randn_unif(0,w);
    L = y - v;
    R = L + w;
    //expansion step
    J = Math.floor(max_steps*randn_unif(0,1));
    K = (max_steps-1)-J;
    while((u<ddist(px,L)) & (J>0)){
        L = L - w;
        J = J - 1;
    }

    while((u<ddist(px,R)) & (K>0)){
        R = R + w;
        K = K - 1;
    }

    //sample and shrink
    if(L >= R){
        py = y;
    } else {
        py = randn_unif(L,R);
        var iter = 0;
        while (u>=ddist(px,py) & iter < max_iter){
            py = randn_unif(L,R);
            if(py>y) R = py;
            if(py<x) L = py;
            iter +=1;

        }
    }

    return {x:px , y:py, px:px, py:py};
}

function randn_bm() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function randn_unif(L,R) {

    var u = Math.random(); //Converting [0,1) to (0,1)
    return L + (R-L)*u;
}




/* Histogram setup */
var Histogram = function(data){
    // set the ranges
    var x = d3.scaleLinear()
              .domain([0,5])
              .rangeRound([0.1*width, 0.9*width]);
    var y = d3.scaleLinear()
              .range([0.9*height, 0.1*height]);
    // set the parameters for the histogram

    this.data = data;




    var x = d3.scaleLinear()
            .domain(d3.extent(this.data))
            .range([0, width]);


    x = d3.scaleBand()
            .rangeRound([0.1*width, 0.9*width])
            .domain(this.data);


    var bins = d3.histogram()
        (this.data);


    var y = d3.scaleLinear()
        .domain([0, d3.max(bins, function(d) { return d.length; })])
        .range([height, 0]);

    var formatCount = d3.format(",.0f");

    var bar = svg.selectAll(".bar")
      .data(bins)
      .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

    var measures = bar.append("rect")
        .attr("x", 1)
        .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
        .attr("height", function(d) { return height - y(d.length); });

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
        .attr("text-anchor", "middle")
        .text(function(d) { return formatCount(d.length); });



    this.update = function(data){


        //select all bars on the graph, take them out, and exit the previous data set.
        //then you can add/enter the new data set
        var bar = svg.selectAll(".bar")
                        .remove()
                        .exit();

        var x = d3.scaleLinear()
                .domain(d3.extent(data))
                .range([0, width]);


            x = d3.scaleBand()
          .rangeRound([0.1*width, 0.9*width])
          .domain(data_freqs.map(function(d){
            return d.key;
          }));


            var bins = d3.histogram()
                (data);


        var y = d3.scaleLinear()
            .domain([0, n])
            .range([0.9*height, 0]);

        var formatCount = d3.format(",.0f");

        var bar = svg.selectAll(".bar")
          .data(data_freqs)
          .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + x(d.key) + "," + y(d.value) + ")"; });

        var measures = bar.append("rect")
            .attr("x", 1)
            .attr("width", x(data_freqs[1].key) - x(data_freqs[0].key) - 1)
            .attr("height", function(d) { return height - y(d.value); });

        bar.append("text")
            .attr("dy", ".75em")
            .attr("y", 6)
            .attr("x", (x(data_freqs[1].key) - x(data_freqs[0].key)) / 2)
            .attr("text-anchor", "middle")
            .text(function(d) { return d.value; });

        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height*0.05 + ")")
            .call(d3.axisBottom(x));



    }//end update

}

/* Simple, reusable slider in pure d3 */
