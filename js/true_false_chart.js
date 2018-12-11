/*

Set up main DIV

*/


function createTrueFalsePlot(div_id){

    /*
    Define functions
    */
    var display_eq = false;

    function translatePoints(points,dx,dy){
        return points.map(p => ({ x: parseFloat(p.x) + dx, y: parseFloat(p.y) + dy }));
    }

    function shiftToFixedPoints(points,x,y){
        //shift points so first co-ordinate is at x and y.
        var dx = x - parseFloat(points[0].x);
        var dy = y - parseFloat(points[0].y);
        return translatePoints(points,dx,dy)
    }

    function reducePoints(points,kx,ky){
        var p = shiftToFixedPoints(points,0,0);
        p = p.map(p => ({ x: parseFloat(p.x)*kx, y: parseFloat(p.y)*ky }));
        return shiftToFixedPoints(p,points[0].x,points[0].y);
    }

    function createTPPoints(rect_positive,rect_test){
        //define true positive region
        var x1 = parseFloat(rect_positive.attr('x')),
            w1 = parseFloat(rect_positive.attr('width')),
            y1 = parseFloat(rect_positive.attr('y')),
            h1 = parseFloat(rect_positive.attr('height')),
            x2 = parseFloat(rect_test.attr('x')),
            w2 = parseFloat(rect_test.attr('width')),
            y2 = parseFloat(rect_test.attr('y')),
            h2 = parseFloat(rect_test.attr('height'));

        return [{"x":x1,"y":y2}, //upper-left
                {"x":x2 + w2,"y":y2}, //upper-right
                {"x":x2 + w2,"y":y2+h2}, //lower-right
                {"x":x1,"y":y2+h2}]; //lower-left
    }


    function createTNPoints(rect_negative,rect_test){
        // define true negative region
        var x1 = parseFloat(rect_negative.attr('x')),
            w1 = parseFloat(rect_negative.attr('width')),
            y1 = parseFloat(rect_negative.attr('y')),
            h1 = parseFloat(rect_negative.attr('height')),
            x2 = parseFloat(rect_test.attr('x')),
            w2 = parseFloat(rect_test.attr('width')),
            y2 = parseFloat(rect_test.attr('y')),
            h2 = parseFloat(rect_test.attr('height'));

        return [{"x":x2,"y":y2}, //upper-left
                         {"x":x1 + w1,"y":y2}, //upper-right
                         {"x":x1 + w1,"y":y2+h2}, //lower-right
                         {"x":x2,"y":y2+h2}]; //lower-left
    }



    function createFNPoints(rect_negative,rect_test){
        //define false negative region
        var x1 = parseFloat(rect_negative.attr('x')),
            w1 = parseFloat(rect_negative.attr('width')),
            y1 = parseFloat(rect_negative.attr('y')),
            h1 = parseFloat(rect_negative.attr('height')),
            x2 = parseFloat(rect_test.attr('x')),
            w2 = parseFloat(rect_test.attr('width')),
            y2 = parseFloat(rect_test.attr('y')),
            h2 = parseFloat(rect_test.attr('height'));

        return [{"x":x1,"y":y1},
                         {"x":x1 + w1,"y":y1},
                         {"x":x1 + w1,"y":y2},
                         {"x":x2,"y":y2},
                         {"x":x2,"y":y2 + h2},
                         {"x":x1 + w1,"y":y2 + h2},
                         {"x":x1 + w1,"y":y1 + h1},
                         {"x":x1,"y":y1 + h1}];
    }

    function createFPPoints(rect_positive,rect_test){
        var x1 = parseFloat(rect_positive.attr('x')),
            w1 = parseFloat(rect_positive.attr('width')),
            y1 = parseFloat(rect_positive.attr('y')),
            h1 = parseFloat(rect_positive.attr('height')),
            x2 = parseFloat(rect_test.attr('x')),
            w2 = parseFloat(rect_test.attr('width')),
            y2 = parseFloat(rect_test.attr('y')),
            h2 = parseFloat(rect_test.attr('height'));

        return [{"x":x1,"y":y1}, //Top-left
                {"x":x1 + w1,"y":y1}, //Top-right
                {"x":x1 + w1,"y":y1+h1}, //bottom-right
                {"x":x1,"y":y1+h1}, //bottom-left
                {"x":x1,"y":y2+h2}, //inner-left bottom
                {"x":x2+w2,"y":y2+h2}, //inner-right bottom
                {"x":x2+w2,"y":y2}, //inner-right top
                {"x":x1,"y":y2} //inner-left top
                ];
    }

    function createPolygon(svg,points,id,positive,test,text){
        var res = svg.append("g");

        var polygon = res.append("polygon")
        .attr("id",id)
        .attr("points",function(d) {
              return points.map(function(d) { return [d.x,d.y].join(","); }).join(" ");
          })
        .attr('fill', positive ? COLOR1: COLOR2)
        .attr('stroke', test ? COLOR1: COLOR2)
        .attr('stroke-width', '8')
        .style("display", null)
        .attr("opacity",0.0)
        .on("mouseover", function() {
                                   d3.select(this).attr('opacity',1.0); //rectangle
                                   d3.select(this.parentNode)
                                                  .select("text") //text
                                                  .attr("font-family", "sans-serif")
                                                  .attr("font-size", "30px")
                                                  .attr("text-anchor","middle")
                                                  .style("pointer-events", "none")
                                                  .style("display",null)
                                                  .text(text);
                                        })
        .on("mouseout", function() {
                                   d3.select(this).attr('opacity',display_eq? 1.0:0.0); //rectablge
                                   var rtext = d3.select(this.parentNode)
                                                  .select("text"); //text
                                       rtext.style("display","none")


                                       });
       var bbox = polygon.node().getBBox();

       res.append("text")
       .attr("x",bbox.x + bbox.width/2)
       .attr("y",bbox.y + bbox.height/2)
       .style("display","none");

       return res;

    }

    function updatePolygon(obj,points,opacity,duration){

        obj.style("display",null);

        var polygon = obj.select("polygon")
            .attr("opacity",opacity)
            .style("display",null)
            .transition()
            .duration(duration)
            .attr("points",function(d) {
                return points.map(function(d) { return [d.x,d.y].join(","); }).join(" ");
            })
            .on("end",function(d){
                var bbox = obj.select("polygon").node().getBBox();
                obj.select("text")
                .attr("x",bbox.x + bbox.width/2)
                .attr("y",bbox.y + bbox.height/2);
            });





    }

    function hidePolygons(transition_duration,polygons){
        for (var i =0; i < polygons.length; i++){
            polygons[i].transition().duration(transition_duration)
                .style("display","none");
            polygons[i].transition().duration(transition_duration)
                .select("polygon").style("display","none");

        }
        rect_negative.transition().duration(transition_duration)
            .attr("opacity",0.0)
            .on("end",function(d){ d.style("display","none"); });


        rect_test.transition().duration(transition_duration)
            .attr("opacity",0.0)
            .on("end",function(d){ d.style("display","none"); });

        rect_positive.transition().duration(transition_duration)
            .attr("opacity",0.0)
            .on("end",function(d){ d.style("display","none"); });

    }
    /*

    Define variables

    */

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
                .attr("height", 1.25*height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var rect_negative = svg.append('rect')
           .attr('x', .25*width).attr('y', .2*height)
           .attr('width', .25*width).attr('height', .8*height)
           .attr('opacity',1.0).attr('fill', COLOR1);

    var rect_positive = svg.append('rect')
           .attr('x', .5*width).attr('y', .2*height)
           .attr('width', .25*width).attr('height', .8*height)
           .attr('opacity',1.0).attr('fill', COLOR2);

    var rect_test = svg.append('rect')
             .attr('x', (.25+.125)*width).attr('y', .4*height)
             .attr('width', .25*width).attr('height', .4*height)
             .attr('opacity',0.25).attr('fill', 'black');

    var fp_points = createFNPoints(rect_negative,rect_test); //left most object (false negative)
    var poly_fp = createPolygon(svg,fp_points,"fp",true,false,"FN");

    var tn_points = createFPPoints(rect_positive,rect_test);
    var poly_tn = createPolygon(svg,tn_points,"tn",false,false,"TN"); //right-most object (True negative)
    var poly_tn_2 = createPolygon(svg,tn_points,"tn2",false,false,"TN");

    var fn_points = createTNPoints(rect_negative,rect_test); //inner-left object (true postive).
    var poly_fn = createPolygon(svg,fn_points,"fn",true,true,"TP");
    var poly_fn_2 = createPolygon(svg,fn_points,"fn2",true,true,"TP");

    var tp_points = createTPPoints(rect_positive,rect_test);
    var poly_tp = createPolygon(svg,tp_points,"tp",false,true,"FP"); //inner-right object (false positive)
    var poly_tp_2 = createPolygon(svg,tp_points,"tp",false,true,"FP");

    var line_rule = svg.append('line')
                                     .attr('x1', .1*width).attr('x2',.9*width)
                                     .attr('y1', .66*height).attr('y2', .66*height)
                                     .style('cursor','ew-resize')
                                     .style('display',"None")
                                     .attr('stroke-width',8)
                                     .attr('stroke','gray');

   var plus_text = svg.append('text')
                                     .attr("x",.5*width).attr("y",1.*height)
                                     .attr("font-family", "sans-serif")
                                     .attr("font-size", "40px")
                                     .style("fill","gray")
                                     .attr("text-anchor","middle")
                                     .style("pointer-events", "none")
                                     .style("display","None")
                                     .text('+');


    var drag_line = d3.drag()
                                    .on('drag', function(){
                                           var x = d3.event.dx;
                                           var y = d3.event.dy;

                                           var line = d3.select(this);
                                           if(parseInt(line.attr('x1')) + x<.75*width && parseInt(line.attr('x1')) + x>.25*width){
                                               //change line location
                                               line.attr('x1', parseInt(line.attr('x1')) + x)
                                                   .attr('x2',parseInt(line.attr('x2')) + x);
                                               //change rectangle attributes.
                                               rect_negative
                                                    .attr('width',parseInt(rect_negative.attr('width')) + x);

                                               rect_positive.attr('x', parseInt(rect_positive.attr('x')) + x)
                                                     .attr('width',parseInt(rect_positive.attr('width')) - x);

                                           }

                                    });
    /*
    var line_slider = svg.append('line')
                                     .attr('x1', .5*width).attr('x2',.5*width)
                                     .attr('y1', .2*height).attr('y2', height)
                                     .style('cursor','ew-resize')
                                     .attr('stroke-width',8)
                                     .attr('stroke','gray');
                                     //.call(drag_line); no longer implemented
    */
    // reset function
    var reset = function(duration){
        display_eq = false;

        updatePolygon(poly_tp,tp_points,0.0,duration);
        updatePolygon(poly_tp_2,tp_points,0.0,duration);

        updatePolygon(poly_fn,fn_points,0.0,duration);
        updatePolygon(poly_fn_2,fn_points,0.0,duration);

        updatePolygon(poly_fp,fp_points,0.0);

        updatePolygon(poly_tn,tn_points,0.0,duration);
        updatePolygon(poly_tn_2,tn_points,0.0,duration);

        line_rule.attr("opacity",0.0).style("display","None");
        plus_text.attr("opacity",0.0).style("display","None");

        rect_negative.attr("opacity",1.0).style("display",null);
        rect_test.attr("opacity",0.25).style("display",null);
        rect_positive.attr("opacity",1.0).style("display",null);
    }

    // define how long transitions should last
    var transition_duration = 1000;

    // create button group
    var btn_group = d3.select(div_id)
        .append("div")
          .attr("class",'col-md-offset-3 col-md-6')
          .append("div")
            .attr("class","btn-group")
            .attr("role","group");

    var btn_one = btn_group.append("button")
        .attr("type","button")
        .attr("class","btn btn-primary")
        .text("Sensitivity")
        .on('click',function(){
            reset(0);

            display_eq = true;

            var points = shiftToFixedPoints(fn_points,(.5 - .0625)*width,.1*height);
            updatePolygon(poly_fn,points,1.0,transition_duration);

            points = shiftToFixedPoints(fn_points,(.5 - .125 - .125)*width,.8*height);
            updatePolygon(poly_fn_2,points,1.0,transition_duration);

            points = shiftToFixedPoints(fp_points,(.5 + .125)*width,.8*height);
            points = reducePoints(points,.75,.5);
            updatePolygon(poly_fp,points,1.0,transition_duration);

            line_rule.transition()
                .duration(transition_duration)
                .attr("opacity",1.0)
                .style("display",null);

            plus_text.transition()
                .duration(transition_duration)
                .attr("opacity",1.0)
                .style("display",null);

            hidePolygons(transition_duration,[poly_tp,poly_tp_2,poly_tn,poly_tn_2]);
        });

    btn_group.append("button")
        .attr("class","btn btn-primary")
        .attr("type","button")
        .text("Specificity")
        .on("click",function(){
            reset(0);

            display_eq = true;

            var points = shiftToFixedPoints(tn_points,(.5 - .0625)*width,.1*height);
            points = reducePoints(points,.75,.5);
            updatePolygon(poly_tn,points,1.0,transition_duration);

            points = shiftToFixedPoints(tn_points,(.5 - .125 - .125)*width,.9*height);
            points = reducePoints(points,.75,.5);
            updatePolygon(poly_tn_2,points,1.0,transition_duration);

            points = shiftToFixedPoints(tp_points,(.5 + .125)*width,.9*height);
            updatePolygon(poly_tp,points,1.0,transition_duration);

            line_rule.transition()
                .duration(transition_duration)
                .attr("opacity",1.0)
                .style("display",null);
            plus_text.transition()
                .duration(transition_duration)
                .attr("opacity",1.0)
                .style("display",null);

            hidePolygons(transition_duration,[poly_fn,poly_fn_2,poly_fp,poly_tp_2]);
        });

    btn_group.append("button")
        .attr("class","btn btn-primary")
        .attr("type","button")
        .text("Precision")
        .on("click",function(){
            reset(0);

            display_eq = true;

            var points = shiftToFixedPoints(fn_points,(.5 - .0625)*width,.1*height);
            updatePolygon(poly_fn,points,1.0,transition_duration);

            points = shiftToFixedPoints(fn_points,(.5 - .125 - .125)*width,.9*height);
            updatePolygon(poly_fn_2,points,1.0,transition_duration);

            points = shiftToFixedPoints(tp_points,(.5 + .125)*width,.9*height);
            updatePolygon(poly_tp,points,1.0,transition_duration);

            line_rule.transition()
                .duration(transition_duration)
                .attr("opacity",1.0)
                .style("display",null);
            plus_text.transition()
                .duration(transition_duration)
                .attr("opacity",1.0)
                .style("display",null);

            hidePolygons(transition_duration,[poly_tp_2,poly_fp,poly_tn,poly_tn_2]);
        });

    btn_group.append("button")
        .attr("class","btn btn-primary")
        .attr("type","button")
        .text("Recall")
        .on("click",function(){
            reset(0);

            display_eq = true;

            var points = shiftToFixedPoints(fn_points,(.5 - .0625)*width,.1*height);
            updatePolygon(poly_fn,points,1.0,transition_duration);

            points = shiftToFixedPoints(fn_points,(.5 - .125 - .125)*width,.9*height);
            updatePolygon(poly_fn_2,points,1.0,transition_duration);

            points = shiftToFixedPoints(fp_points,(.5 + .125)*width,.9*height);
            points = reducePoints(points,.75,.5);
            updatePolygon(poly_fp,points,1.0,transition_duration);

            line_rule.transition()
                .duration(transition_duration)
                .attr("opacity",1.0)
                .style("display",null);
            plus_text.transition()
                .duration(transition_duration)
                .attr("opacity",1.0)
                .style("display",null);

            hidePolygons(transition_duration,[poly_tn,poly_tn_2,poly_tp_2,poly_tp]);
        });

    btn_group.append("button")
        .attr("class","btn btn-primary")
        .attr("type","button")
        .text("reset")
        .on("click",function(){
            reset(0);
        });



    return svg;
}

var true_false_plot  = createTrueFalsePlot("#positive-negative-explorer");
