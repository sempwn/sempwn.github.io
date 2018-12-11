/*

Set up main DIV

*/


function createTestTreatPlot(div_id){

    var width = d3.select(div_id).node().getBoundingClientRect().width;
    var height = 0.5*width;
    var prevalence = 0.5,
        sensitivity = 0.5,
        specificity = 0.5;

    var margin = {top: 20, right: 30, bottom: 30, left: 40};
    var COLOR1 = "#fdae61",
        COLOR2 = "#4393c3";

    width = width-margin.right-margin.left;
    height = height-margin.top-margin.bottom;

    var svg = d3.select(div_id)
        .append("div")
        .attr("class","row")
        .append("div")
            .style("float","left")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var summary_text = d3.select(div_id)
                          .append("p");

    //create console

    //Create sliders
    var makeSlider = function(div,text,onChange,min="0.01",max="0.2",
                              step="0.01",defaultValue="0.0",
                              div_offset="3",div_width="6"){

        var slide_div = div.append("div")
                            .attr("class",'col-md-offset-' +
                                  div_offset + ' col-md-' + div_width);

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

    /*
    Make sliders prevalence and sensitivity and specificity
    <div class="row">
        <div class="col-md-offset-3 col-md-offset-6">
            <input></input>
        </div>
    </div>
    <div class = "row">
        <div class="col-md-offset-3 col-md-offset-3">
            <input></input>
        </div>
        <div class="col-md-offset-3 col-md-offset-3">
            <input></input>
        </div>
    </div>
    */
    var slider_console = d3.select(div_id);
    var slider_console_first_row = slider_console.append("div").attr("class","row");
    makeSlider(slider_console_first_row,"prevalence",function(d){
        var val = d.property('value');
        prevalence = parseFloat(val);
        infect();
    }
               ,min="0",max="1",step="0.01",defaultValue="0.5");

   var slider_console_second_row = slider_console.append("row");
   makeSlider(slider_console_second_row,"sensitivity",function(d){
       var val = d.property('value');
       sensitivity = parseFloat(val);
   }
              ,min="0",max="1",step="0.01",defaultValue="0.5",
              div_offset="3",div_width="3");

  makeSlider(slider_console_second_row,"specificity",function(d){
      var val = d.property('value');
      specificity = 1 - parseFloat(val);
  }
             ,min="0",max="1",step="0.01",defaultValue="0.5",
             div_offset="0",div_width="3");


    /*
    <div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-secondary">Left</button>
        <button type="button" class="btn btn-secondary">Middle</button>
        <button type="button" class="btn btn-secondary">Right</button>
    </div>

    */
    var btn_group = d3.select(div_id)
        .append("div")
          .attr("class",'col-md-offset-4 col-md-4')
          .append("div")
            .attr("class","btn-group")
            .attr("role","group");

    var btn_one = btn_group.append("button")
        .attr("type","button")
        .attr("class","btn btn-primary")
        .text("Set positives")
        .on('click',function(){
            reset();
            infect();
        });

    btn_group.append("button")
        .attr("class","btn btn-primary")
        .attr("type","button")
        .text("Test")
        .on("click",function(){
            applyTest();
        });

    btn_group.append("button")
        .attr("class","btn btn-primary")
        .attr("type","button")
        .text("Sort")
        .on("click",function(){
            createConfusionMatrix();
        });





    var nodes = createNodes(5,10,width,height,margin);

    //draw circles
    svg.selectAll('circle')
                        .data(nodes)
                      .enter().append('svg:circle')
                        .attr('r', function (d, i) {
                          return d.r;
                        })
                        .attr('id', function (d, i) {
                          return 'circle-' + d.id;
                        })
                        .attr('cx', function (d, i) {
                          return d.x;
                        })
                        .attr('cy', function (d, i) {
                          return d.y;
                        })
                        .attr("stroke-width",3)
                        .attr("fill",COLOR2)
                        .attr("stroke",COLOR2)
                        .on("mouseover", function() {
                                             var circle = d3.select(this).datum();
                                             annotation
                                             .attr('x', circle.x)
                                             .attr('y', circle.y+circle.r/2)
                                             .text(function(){
                                                   var result = '';
                                                   if (circle.infected && circle.test){
                                                       result = 'TP';
                                                   }else if(!circle.infected && !circle.test){
                                                       result = 'TN';
                                                   }else if(circle.infected && !circle.test){
                                                       result = 'FN';
                                                   }else if(!circle.infected && circle.test){
                                                       result = 'FP';
                                                   }

                                                   return result;
                                               })
                                             .style("display", null);
                                                  })
                        .on("mouseout", function() {
                                             annotation.style("display","none")
                                                       .attr("text-anchor","middle");
                                                 });

    // draw rectangle overlays
    var createConfusionRectangle = function(svg,label,offset_x,offset_y){
        var rect = svg.append("g");

        rect.append('rect')
               .attr('x', (1+offset_x)*width/4)
               .attr('y', (1+offset_y)*height/4)
               .attr('width', width/4-8)
               .attr('height',height/4-8)
               .attr('opacity',0.25)
               .attr('fill', offset_y ? COLOR1: COLOR2)
               .attr('stroke', offset_x ? COLOR1: COLOR2)
               .attr('stroke-width', '8')
               .style("display", "none")
               .on("mouseover", function() {
                                    d3.select(this).attr('opacity',1.0); //rectangle
                                    d3.select(this.parentNode)
                                                   .select("text") //text
                                                   .text(label);
                                         })
               .on("mouseout", function() {
                                    d3.select(this).attr('opacity',0.25); //rectablge
                                    var rtext = d3.select(this.parentNode)
                                                   .select("text"); //text
                                        rtext.text(rtext.attr("data-text"));

                                        });

        rect.append("text")
               .attr('x', (1.5+offset_x)*width/4)
               .attr('y', (1.5+offset_y)*height/4)
               .attr("font-family", "sans-serif")
               .attr("font-size", "30px")
               .attr("text-anchor","middle")
               .style("pointer-events", "none")
               .text("")
               .attr("data-text","")
               .style("display", "none");

        return rect;
    }
    var hideConfusionMatrix = function(rects){
        var rect;
        for(var i = 0; i < rects.length; i++){
            rect = rects[i];
            rect.select("rect")
                .transition()
                .style("display", "none");


            rect.select("text")
                  .transition()
                  .style("display", "none");
          }
      }

    var rect_tn = createConfusionRectangle(svg,"TN",0,0);

    var rect_tp = createConfusionRectangle(svg,"TP",1,1);

    var rect_fn = createConfusionRectangle(svg,"FN",0,1);

    var rect_fp = createConfusionRectangle(svg,"FP",1,0);

    var annotation = svg.append("text")
                        .attr("font-size", "30px")
                        .attr("text-anchor","middle")
                        .text("")
                        .style("pointer-events", "none")
                        .style("display", "none");


    // Infect test and confusion functions

    var infect = function(){
        for(var i=0; i < nodes.length; i++){
            nodes[i].infected = Math.random() < prevalence;
            nodes[i].test = nodes[i].infected;
        }
        svg.selectAll('circle')
            .transition()
            .duration(500)
            .attr("fill",function (d, i) {
              return (d.infected)? COLOR1 : COLOR2;
            })
            .attr("stroke",function (d, i) {
              return (d.infected)? COLOR1 : COLOR2;
            });
    }

    var applyTest = function(){
        var prob;
        for(var i=0; i < nodes.length; i++){
            prob = (nodes[i].infected)? sensitivity : specificity;
            nodes[i].test = Math.random() < prob;
        }
        svg.selectAll('circle')
            .transition()
            .duration(500)
            .attr("stroke",function (d, i) {
              return (d.test)? COLOR1 : COLOR2;
          });
    }

    var createConfusionMatrix = function(){
        var showConfusionRectangle = function(rect,delay,val){
            rect.select("rect")
                   .transition()
                   .delay(delay)
                   .style("display", null);

            rect.select("text")
                  .transition()
                  .delay(delay)
                  .style("display", null)
                  .text(val)
                  .attr("data-text",val);
        }

        var tn=0,
            fn=0,
            fp=0,
            tp=0;
        var node;

        for(var i=0; i < nodes.length; i++){
            node = nodes[i];
            tn += (1-node.infected)*(1-node.test);
            tp += (node.infected)*(node.test);
            fp += (1-node.infected)*(node.test);
            fn += (node.infected)*(1-node.test);
        }

        svg.selectAll('circle')
            .transition() //first transition move circle to confusion rectangle in sequence
            .delay(function (d,i) {
                return (d.infected + 2*d.test)*1000;
            })
            .duration(function (d,i) {
                return 1000;
            })
            .attr("cx",function (d, i) {
              return (1.5*width/4 + d.test * width/4 );
            })
            .attr("cy",function (d, i) {
                return (1.5*height/4 + d.infected * height/4 );
            })
            .transition() //second transition hides circle
            .style("display", "none");


        showConfusionRectangle(rect_tn,1000,tn);

        showConfusionRectangle(rect_tp,4000,tp);

        showConfusionRectangle(rect_fn,2000,fn);

        showConfusionRectangle(rect_fp,3000,fp);

        var f1_score = 2*tp/(2*tp + fp + fn),
            ppv = tp/(tp+fp),
            npv = tn/(tn+fn),
            acc = (tp+tn)/(tp+tn+fp+fn),
            calc_sens = tp/(tp+fn),
            calc_spec = tn/(tn+fp);

        summary_text.transition()
        .delay(4000)
        .text(
            "Positive predictive value (precision): " + ppv.toFixed(2) + '\n'+
            "Negative predictive value: " + npv.toFixed(2) + '\n'+
            "Sensitivity: " + calc_sens.toFixed(2) + '\n'+
            "Specificity: " + calc_spec.toFixed(2) + '\n'+
            "Accuracy: " + acc.toFixed(2) + '\n'+
            "F1 score: " + f1_score.toFixed(2) + '\n'
            )
            .style('border-style', 'solid');

    }

    var reset = function(){

        svg.selectAll('circle')
            .transition(500)
            .attr('cx', function (d, i) {
              return d.x;
            })
            .attr('cy', function (d, i) {
              return d.y;
            })
            .attr("stroke-width",3)
            .attr("fill",COLOR2)
            .attr("stroke",COLOR2)
            .style("display", null);

        hideConfusionMatrix([rect_tp,rect_tn,rect_fn,rect_fp]);
        summary_text.text("")
                    .style('fill','black')
                    .style('border-style', null);

    }



    return nodes;


}

var createNodes = function (numRows, numCols, width, height, margin) {
  var nodes = [],
      x=0,
      y=0,
      i=0;

  for (var row=0; row<numRows; row++) {
      y = margin.bottom + (row/numRows)*height;

      for (var col=0; col<numCols; col++) {

          x = margin.left + (col/numCols)*width;
          nodes.push({'id': ++i, 'x': x, 'y': y, 'infected': false,
                      'r': .5*.5*height/numRows, 'test': false});

      }
  }

  return nodes;
}

var infected  = createTestTreatPlot("#test-treat");
