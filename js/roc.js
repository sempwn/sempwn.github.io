

/*

Set up main DIV

*/


function createROCPlot(main_div_id){

    var width = d3.select(main_div_id).node().getBoundingClientRect().width;
    var height = 0.5*width;
    var xstep = 0.1;
    var margin = {top: 20, right: 30, bottom: 30, left: 40};
    var COLOR1 = "#fdae61",
        COLOR2 = "#4393c3";

    width = width/2-margin.right-margin.left;
    height = height-margin.top-margin.bottom;

    //Create sliders
    var makeSlider = function(div_id,text,onChange,min="0.01",max="0.2",
                              step="0.01",defaultValue="0.0"){
        var slide_div = d3.select(div_id).append("row").append("div")
                                            .attr("class",'col-md-offset-3 col-md-6');

        slide_div.append("label").attr("for","alpha")
                             .text(text);
        function slideChange(){
            onChange(slide);
        }
        var slide = slide_div.append("input").attr("type","range")
                            .attr("min",min)
                            .attr("max",max)
                            .attr("step",step)
                            .attr("defaultValue",defaultValue)
                            .on("change",slideChange);
    }

    makeSlider(main_div_id,"mean",function(d){
        var val = d.property('value');
        mu = parseFloat(val);
        updateData();
    }
               ,min="-30",max="30",step="0.1",defaultValue="0");

    makeSlider(main_div_id,"variance",function(d){
        var val = d.property('value');
        sigma = parseFloat(val);
        updateData();
    }
               ,min="5",max="100",step="0.5",defaultValue="15");

    /*

    Create line plots

    */

    var mu= 0,
        sigma = 15;

    var array1 = Random_normal_Dist(0, 15),
        array2 = Random_normal_Dist(mu, sigma);

    var x = d3.scaleLinear()
                .rangeRound([0, width]);

        //Min q
        var d1 = d3.min(array1, function (d) { return d.q; });
        var d2 = d3.min(array2, function (d) { return d.q; });
        var min_d = d3.min([d1, d2]);

        //Max q
        d1 = d3.max(array1, function (d) { return d.q; });
        d2 = d3.max(array2, function (d) { return d.q; });
        var max_d = d3.max([d1, d2]);

        //Max p
        d1 = d3.max(array1, function (d) { return d.p; });
        d2 = d3.max(array2, function (d) { return d.p; });
        var max_p = d3.max([d1, d2]);

      x.domain([min_d, max_d]).nice;

      var y = d3.scaleLinear()
          .domain([0, max_p])
          .range([height, 0]);

      var svg = d3.select(main_div_id)
          .append("div")
              .style("float","left")
              .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var gX = svg.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + height + ")")
                  .call(d3.axisBottom(x));


      var line = d3.line()
          .x(function (d) { return x(d.q); })
          .y(function (d) { return y(d.p); });


      var line1 = svg.append("path")
                     .datum(array1)
                     .attr("class", "line")
                     .attr("d", line)
                     .style("fill", COLOR2)
                     .style("opacity", "0.5");

      var line2 = svg.append("path")
                     .datum(array2)
                     .attr("class", "line")
                     .attr("d", line)
                     .style("fill", COLOR1)
                     .style("opacity", "0.5");


      function Random_normal_Dist(mean, sd) {
          data = [];
          for (var i = -60; i < 60; i += xstep) {
              q = i
              p = normal_pdf(i, mean, sd);
              arr = {
                  "q": q,
                  "p": p
              }
              data.push(arr);
          };
          return data;
      }



      // ** Update when slider called
    function updateData() {

        var roc_area = roc_calculate(0, 15, mu, sigma);
        array2 = Random_normal_Dist(mu, sigma);
        array_roc = roc_curve(0, 15, mu, sigma);

        roc_title.text("ROC = " + roc_area.toFixed(2));
        // Make the changes
        line2.datum(array2)
        .transition().duration(750)
        .attr("d", line)

        line_roc.datum(array_roc)
        .transition().duration(750)
        .attr("d", line_function);

    }



    /*


    Construct ROC curve

    */

    //Define RHS svg
    var svg_roc = d3.select(main_div_id)
        .append("div")
            .style("float","left")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")");
    //RHS x-axis
    var x_roc = d3.scaleLinear()
                .domain([0,100])
                .range([0, width]);

    //RHS graph y-axis
    var y_roc = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

    //text label for title
    var roc_title =  svg_roc.append("text")
                .attr("x", (width / 2))
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("text-decoration", "underline")
                .text("ROC = 0.5");






    // create x axis
    svg_roc.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x_roc));

    // text label for the x axis
    svg_roc.append("text")
        .attr("transform",
              "translate(" + (width/2) + " ," +
                             (height + 1.5*margin.top) + ")")
        .style("text-anchor", "middle")
        .text("False positive rate (100 - specificity) (%)");

    //create y axis
    svg_roc.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(0," + 0 + ")")
                .call(d3.axisLeft(y_roc));

    // text label for the y axis
    svg_roc.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("True positive rate (sensitivity) (%)");



    var array_roc = roc_curve(0, 15, mu, sigma);

    var line_function = d3.line()
        .x(function (d) { return x_roc(d.q); })
        .y(function (d) { return y_roc(d.p); });

    var line_roc = svg_roc.append("path")
                   .datum(array_roc)
                   .attr("class", "line")
                   .attr("d", line_function)
                   .attr('stroke-width', 2)
                   .attr('fill', 'none');

    //dashed guide line
    svg_roc.append("path")
           .datum([{p:0,q:0},{p:100,q:100}])
           .attr("class", "line")
           .attr("d", line_function)
           .attr('stroke-width', 2)
           .style("stroke-dasharray", ("3, 3"))
           .attr('fill', 'none');


    /*

    mouse over effects


    */


    function createFocusPointer(svg,color){
        var focus = svg.append("g")
              .attr("class", "focus")
              .style("display", "none");

          focus.append("circle")
              .attr("r", 2.4)
              .attr("stroke-width",3)
              .attr("stroke",color);

          focus.append("text")
              .attr("x", 9)
              .attr("dy", ".35em");

          return focus;

    }

    function createFocusLine(svg){
        var focus = svg.append("path")
                       .datum([{p:0,q:0},{p:100,q:100}])
                       .attr("d", line_function)
                       .attr('stroke-width', 2)
                       .style("stroke-dasharray", ("3, 3"))
                       .attr('fill', 'none')
                       .attr("class", "focus line")
                       .style("display", "none");



          return focus;

    }

    var focus1 = createFocusPointer(svg,COLOR2);
    var focus2 = createFocusPointer(svg,COLOR1);
    var focus3 = createFocusPointer(svg_roc,"#000000");

    var focus_line = createFocusLine(svg);
    var focus_line_roc_x = createFocusLine(svg_roc);
    var focus_line_roc_y = createFocusLine(svg_roc);


    function createOverlay(svg,getX){
        function mousemove() {
          //var x0 = x.invert(d3.mouse(this)[0]);
          //i = parseInt((x0+60)/.5);
          var i = getX(d3.mouse(this)[0]);

          var p_x = x(array1[i].q),
              p_y = y(array1[i].p),
              roc_p_x = x_roc(array_roc[i].q),
              roc_p_y = y_roc(array_roc[i].p);


          focus1.transition().duration(50)
                .attr("transform", "translate(" + x(array1[i].q) + "," + y(array1[i].p) + ")");
          focus1.select("text").text("");

          focus2.transition().duration(50)
                .attr("transform", "translate(" + x(array2[i].q) + "," + y(array2[i].p) + ")");
          focus2.select("text").text("");

          var tpr = array_roc[i].p,
              fpr = array_roc[i].q,
              ppv = 100*tpr/(tpr+fpr),
              npv = 100*(100-fpr)/(100 - fpr + 100 - tpr);

          focus3.transition().duration(50)
                .attr("transform", "translate(" + x_roc(array_roc[i].q) + "," + y_roc(array_roc[i].p) + ")");

          focus3.selectAll("text").remove();
          focus3.append("text")
                    .attr("x", 9)
                    .attr("dy", ".35em")
                    .text("tpr: " + tpr.toFixed(0) +
                          "% fpr: " + fpr.toFixed(0) + "%");
          focus3.append("text")
                    .attr("x", 9)
                    .attr("dy", "1.35em")
                    .text("ppv: " + ppv.toFixed(0) +
                        "% npv: " + npv.toFixed(0) + "%");




          focus_line_roc_x.datum([{p:0,q:array_roc[i].q},{p:array_roc[i].p,q:array_roc[i].q}])
          .transition().duration(50)
          .attr("d", line_function);

          focus_line_roc_y.datum([{p:array_roc[i].p,q:0},{p:array_roc[i].p,q:array_roc[i].q}])
          .transition().duration(50)
          .attr("d", line_function);

          focus_line.datum([{p:0,q:array1[i].q},{p:100.,q:array1[i].q}])
          .transition().duration(50)
          .attr("d", line);


        }
          svg.append("rect")
              .attr("class", "overlay")
              .attr("width", width)
              .attr("height", height)
              .on("mouseover", function() { focus1.style("display", null);
                                            focus2.style("display", null);
                                            focus3.style("display", null);
                                            focus_line_roc_x.style("display", null);
                                            focus_line_roc_y.style("display", null);
                                            focus_line.style("display", null);
                                        })
              .on("mouseout", function() { focus1.style("display", "none");
                                           focus2.style("display", "none");
                                           focus3.style("display", "none");
                                           focus_line_roc_x.style("display", "none");
                                           focus_line_roc_y.style("display", "none");
                                           focus_line.style("display", "none");
                                       })
              .on("mousemove", mousemove);
    }

    createOverlay(svg,function(x0){
        x0 = x.invert(x0);
        return parseInt((x0+60)/xstep)
    });

    createOverlay(svg_roc,function(p){
        p = x_roc.invert(p);
        //var x0 = normal_inv_cdf(1-p/100, 0, 15);
        //var i = parseInt((x0+60)/.5);
        var i = closest(p, array_roc);
        return i;
    });


    function roc_curve(mu1, sigma1, mu2, sigma2) {
        data = [];
        for (var x = -60; x < 60; x += xstep) {
            var arr = sens_spec(x,mu1,sigma1,mu2,sigma2);
            data.push(arr);
        };
        return data;
    }

    return [svg,svg_roc];

}



/*



Math functions


*/


function normal_cdf(x, mu, sigma) {
  return 0.5 * (1 + erf((x - mu) / (Math.sqrt(2 * sigma))));
}

function normal_inv_cdf(p, mu, sigma) {

    var a1 = -39.6968302866538, a2 = 220.946098424521, a3 = -275.928510446969;
    var a4 = 138.357751867269, a5 = -30.6647980661472, a6 = 2.50662827745924;
    var b1 = -54.4760987982241, b2 = 161.585836858041, b3 = -155.698979859887;
    var b4 = 66.8013118877197, b5 = -13.2806815528857, c1 = -7.78489400243029E-03;
    var c2 = -0.322396458041136, c3 = -2.40075827716184, c4 = -2.54973253934373;
    var c5 = 4.37466414146497, c6 = 2.93816398269878, d1 = 7.78469570904146E-03;
    var d2 = 0.32246712907004, d3 = 2.445134137143, d4 = 3.75440866190742;
    var p_low = 0.02425, p_high = 1 - p_low;
    var q, r;
    var retVal;

    if ((p < 0) || (p > 1))
    {
        retVal = 0;
    }
    else if (p < p_low)
    {
        q = Math.sqrt(-2 * Math.log(p));
        retVal = (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    }
    else if (p <= p_high)
    {
        q = p - 0.5;
        r = q * q;
        retVal = (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q / (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
    }
    else
    {
        q = Math.sqrt(-2 * Math.log(1 - p));
        retVal = -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    }

    return mu + retVal*Math.sqrt(sigma);
}

function erf(x) {
  // save the sign of x
  var sign = (x >= 0) ? 1 : -1;
  x = Math.abs(x);

  // constants
  var a1 =  0.254829592;
  var a2 = -0.284496736;
  var a3 =  1.421413741;
  var a4 = -1.453152027;
  var a5 =  1.061405429;
  var p  =  0.3275911;

  // A&S formula 7.1.26
  var t = 1.0/(1.0 + p*x);
  var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y; // erf(-x) = -erf(x);
}

function normal_pdf(x,mu,sigma){
    return (1/Math.sqrt(2*Math.PI*sigma))*
       Math.exp(-(0.5/sigma)*Math.pow(x-mu,2))
}

function sens_spec(x,mu1,sigma1,mu2,sigma2) {
    var q = 100.*(1 - normal_cdf(x, mu1, sigma1));
    var p = 100.*(1 - normal_cdf(x, mu2, sigma2));

    return {
        "q": q,
        "p": p
    }
}



function roc_calculate(mu1, sigma1, mu2, sigma2) {
    var result = 0;
    var dt = 0.1;
    for (var x = -60; x < 60; x += dt) {
        result += (1-normal_cdf(x, mu2, sigma2))*normal_pdf(x,mu1,sigma1)*dt;
    };

    return result;
}

function closest (num, arr) {
    var curr = 0;
    var diff = Math.abs (num - arr[curr].q);
    for (var val = 0; val < arr.length; val++) {
        var newdiff = Math.abs (num - arr[val].q);
        if (newdiff < diff) {
            diff = newdiff;
            curr = val;
        }
    }
    return curr;
}

window.onload = function () {
    var main_div_id = '#main-roc';
    createROCPlot(main_div_id);

}
