function hiddenPopSim(div_id,mark_recapture,demo){
    /*
    mark_recapture - set-up simulation for mark recapture scenario
    demo - set-up simulation for demo
    */
    if(mark_recapture=== undefined){
        mark_recapture = false;
    }

    if(demo === undefined){
        demo = false;
    }
    if(demo===true){
        mar_recapture = true;
    }

    var pause = true;
    if(demo){
        pause = false;
    }


    if(mark_recapture){
        //track if in first or second round.
        var first_round = true;
        var second_round = false;
    }
    var width = d3.select("#"+div_id).node().getBoundingClientRect().width,
        height = 0.6*width;


    var svg = d3.select("#"+div_id).append("svg:svg")
                               .attr("width",width)
                               .attr("height",height)
                               .append('g');

    // https://github.com/wbkd/d3-extended
    d3.selection.prototype.moveToFront = function() {
     return this.each(function(){
       this.parentNode.appendChild(this);
     });
    };
    d3.selection.prototype.moveToBack = function() {
       return this.each(function() {
           var firstChild = this.parentNode.firstChild;
           if (firstChild) {
               this.parentNode.insertBefore(this, firstChild);
           }
       });
    };
    var getFrequency = function(arr) {
        var freq = {};
        for (var i=0; i<arr.length;i++) {
            var character = arr[i];
            if (freq[character]) {
               freq[character]++;
            } else {
               freq[character] = 1;
            }
        }

        return freq;
    };
    var randomPlacement = function(length,border){
        return length*(border) + Math.random()*length*(1-2*border);
    }

    var velocityUpdate = function(vel){
        vel = vel + 0.5*(0.5 - Math.random());
        vel = (vel> 2.0)? 2.0 : vel;
        vel = (vel < -2.0)? -2.0 : vel;
        return vel
    }

    var checkBoundary = function(d){
        if (d.x < 0){
            d.vx = (d.vx < 0)? -d.vx:d.vx;
        }else if (d.x > width){
            d.vx = (d.vx > 0)? -d.vx:d.vx;
        }

        if (d.y < 0){
            d.vy = (d.vy < 0)? -d.vy:d.vy;
        }else if(d.y > height){
            d.vy = (d.vy > 0)? -d.vy:d.vy;
        }

    }

    var checkCaptured = function(d,c){
        var co = {};
        co.x = Number(c.attr("cx"));
        co.y = Number(c.attr("cy"));
        co.r = Number(c.attr("r"))
        var xvec = Math.pow((d.x - co.x),2);
        var yvec = Math.pow((d.y - co.y),2);
        if(Math.sqrt(xvec + yvec)<= co.r){
            return true;
        }else{
            return false;
        }
    }

    var counterUpdatePoisson = function(d){
        var inside = checkCaptured(d,capture_circle);
        if(inside && !d.inside){
            d.count += 1;
            d.inside = true;
        }
        if(!inside && d.inside){
            d.inside = false;
        }
        return d;
    }

    var counterUpdateMarkRecapture = function(d){
        var inside = checkCaptured(d,capture_circle);
        if(inside && !d.inside && first_round){
            d.capture = true;
            d.inside = true;
        }else if(inside && !d.inside && second_round){
            d.recapture = true;
            d.inside = true;
        }

        if(!inside && d.inside){
            d.inside = false;
        }
        return d;
    }

    var counterUpdate = function(d){}

    if(!mark_recapture){
        counterUpdate = counterUpdatePoisson;
    } else {
        counterUpdate = counterUpdateMarkRecapture;
    }


    var colorCircle = function(d){
        var f = d3.schemeCategory10;
        if(mark_recapture){
            if (!d.capture && ! d.recapture){
                return f[0];
            } else if(d.capture && ! d.recapture){
                return f[1];
            } else if(!d.capture &&  d.recapture){
                return f[2];
            } else {
                return f[3];
            }
        }else {
            if(d.count > 0){
                return "red";
            } else {
                return "blue";
            }
        }
    }
    /*MATH FUNCTIONS */

    var popEstTruncPoissNewRap = function(circle){
        //args: m - mean, n - popsize
        //returns value for rate lambda
        var res = popEstimateZeroTruncated(circle);
        var m = res['mean'], n = res['n'], lbda = res['lambda'];
        //var flbda = 0, dflbda = 0;
        //var dt = 0.1;
        var objective = function(lbda){
            return Math.log(1-Math.exp(-lbda)) + n*lbda - Math.log(lbda)*n*m;
        }
        try{
            res = numeric.uncmin(objective,[lbda]);
            lbda = res.solution[0];
        }catch(err){
            console.log(err);
        }
        /*
        for(i=0;i<100;i++){
            flbda = -Math.log(1-Math.exp(-lbda)) - n*lbda + Math.log(lbda)*n*m;
            dflbda = Math.exp(-lbda)/(1-Math.exp(-lbda)) - n + n*m/lbda;
            ddflbda = Math.exp(-lbda)/Math.pow((1-Math.exp(-lbda)),2) - n*m/Math.pow(lbda,2);
            lbda = lbda - dflbda/ddflbda;
            console.log(lbda);
        }
        */
        var zero_pop = n*Math.exp(-lbda)/(1-Math.exp(-lbda));
        var total_pop = n+zero_pop;
        return { 'unobserved':zero_pop, 'total':total_pop}
        return lbda
    }

    var popEstimateZeroTruncated = function(circle){
        var counts = 0,n=0;
        circle.each(function(d){
            if(d.count>0){
                counts += d.count;
                n += 1;
            }
        });
        var my = counts/n;
        var zero_pop = n*Math.exp(-my+1)/(1-Math.exp(-my+1));
        var total_pop = n+zero_pop;
        return { 'unobserved':zero_pop, 'total':total_pop,'lambda':my-1,'mean':my,
                  'n':n}
    }

    var popEstimateMarkRecapture = function(circle){
        var k = 0,
            n = 0,
            K = 0;
        circle.each(function(d){
                n += (d.capture)? 1:0;
                K += (d.recapture)? 1:0;
                k += (d.capture && d.recapture)? 1:0;
        });
        var lincoln = n*K/k;
        var chapman = (n+1)*(K+1)/(k+1) - 1;
        return { 'Chapman':chapman, 'Lincoln':lincoln}
    }



    var circleData = [];

    var n = 10;
    var sim_speed = 0.1;
    function emptyData(data){
        data = [];
    }

    function createCircleData(){
        for (var i = 0; i < n; i++){
            var circle = {};
            circle.id = i;
            circle.r = 5;
            circle.vx = 0.5-Math.random();
            circle.vy = 0.5 - Math.random();
            circle.x = randomPlacement(width,0.1);
            circle.y = randomPlacement(height,0.1);
            circle.c = "blue";
            circle.count = 0; //counts how many times enter capture circle.
            circle.capture = false; //count whether circle is initially captured.
            circle.recapture = false; // count whether circle has been captured in second round.
            circle.inside = false; //variable that checks if inside capture circle.
            circleData.push(circle);
        }
    }

    createCircleData(circleData,n);

    /* Create the circle elements, and move them into their start positions */
    var circle,labels;
    function createCircle(){

     circle = svg.selectAll(".popCircle")
    	.data(circleData, function(d) { return d.id;})
    	.enter()
        .append("circle")
        .attr("class","popCircle")
        .attr("r", function(d)	{ return d.r; })
        .attr("cx", function (d) { return d.x})
        .attr("cy", function (d) { return d.y});
        // Position the g element like the circle element used to be.
        /*.attr("transform", function(d, i) {
          return "translate(" + d.x + "," + d.y + ")";
      });*/
      /* Create the text for each block */
      labels = svg.selectAll(".circleLabel")
          .data(circleData)
          .enter()
          .append("text")
          .attr("class","circleLabel")
          .attr("x", function(d) { return d.x; })
          .attr("y", function(d) { return d.y; })
          .text(function(d){return d.count})
    }

    function updateCircle(circle){
        circle

        .attr("cx",function(d){
            d.vx = velocityUpdate(d.vx);
            d.x += sim_speed*d.vx;
            return d.x })
        .attr("cy",function(d){
            d.vy = velocityUpdate(d.vy);
            d.y += sim_speed*d.vy;
            return d.y})
        /*.attr("transform", function(d) {
            d.vy = velocityUpdate(d.vy);
            d.y += d.vy;
            d.vx = velocityUpdate(d.vx);
            d.x += d.vx;
            return "translate(" + d.x + "," + d.y + ")";
        })*/
        /*.select('circle')*/
        .attr("fill",function(d){
            return colorCircle(d);
        });

        labels
        .attr("x",function(d){
            return d.x;
        })
        .attr("y", function(d){
            return d.y;
        })
        .text( function (d) {
            if(!mark_recapture){
                return d.count;
            } else {
                return '';
            }
        });
    }

    function destroyCircle(){
        svg.selectAll(".popCircle")
        .remove()
        .exit();

        svg.selectAll(".circleLabel")
        .remove()
        .exit();
    }
     createCircle();
     updateCircle(circle);





    var capture_circle = (function(rr){
        var obj = {};
        var r = width*rr;
        obj.x = .5*(width-.5*r);
        obj.y = .5*(height-.5*r);
        obj.r = r;
        return obj;
    })(0.1);

    capture_circle = svg.append("circle")
        .attr('cx', capture_circle.x)
        .attr('cy', capture_circle.y)
        .attr('r', capture_circle.r)
        .attr('fill', '#babdb6')
        .attr('fill-opacity', 0.5);
    /*
    function update(){
        circle.transition().duration(50).ease("linear")
            .attr("cx",function(d){
                d.vx = velocityUpdate(d.vx);
                d.x += d.vx;
                return d.x })
            .attr("cy",function(d){
                d.vy = velocityUpdate(d.vy);
                d.y += d.vy;
                return d.y})
            .each('end', function(){
                update();
            });
    }

    update();
    */




    /* Histogram setup */
    var Histogram = function(){
        // set the ranges
        var x = d3.scaleLinear()
                  .domain([0,5])
                  .rangeRound([0.1*width, 0.9*width]);
        var y = d3.scaleLinear()
                  .range([0.9*height, 0.1*height]);
        // set the parameters for the histogram
        if(!mark_recapture){
            this.data = circleData.map(function(d){return d.count});
        } else {
            this.data = circleData.map(function(d){
                var output = '';
                if(!d.capture && !d.recapture){
                    output = 'A';
                }else if(d.capture && !d.recapture){
                    output = 'B';
                }else if(!d.capture && d.recapture){
                    output = 'C';
                }else{
                    output = 'D';
                }
                return output;
            });
        }



        var x = d3.scaleLinear()
                .domain(d3.extent(this.data))
                .range([0, width]);

        if(mark_recapture){
            x = d3.scaleBand()
          .rangeRound([0.1*width, 0.9*width])
          .domain(this.data);
        }
        if(!mark_recapture){
            var bins = d3.histogram()
                .domain([0,4])
                .thresholds(x.ticks(5))
                (this.data);
        } else{
            var bins = d3.histogram()
                (this.data);
        }

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



        this.visible = false;

        this.show = function(){
            this.update();
            this.visible = true;

        }

        this.hide = function(){
            svg.selectAll(".bar")
                .remove()
                .exit();
            svg.selectAll(".axis")
                .remove()
                .exit();
            this.visible = false;
        }

        this.update = function(){
            if(!mark_recapture){
                var  data = circleData.map(function(d){return d.count});
            }else{
                var data = circleData.map(function(d){
                    var output = '';
                    if(!d.capture && !d.recapture){
                        output = 'unobserved';
                    }else if(d.capture && !d.recapture){
                        output = 'observed in first survey only';
                    }else if(!d.capture && d.recapture){
                        output = 'observed in second survey only';
                    }else{
                        output = 'observed in both surveys';
                    }
                    return output;
                });
                var data_mod_freqs = getFrequency(data);
                var data_freqs = [];
                for(var i in data_mod_freqs){
                    data_freqs.push({key:i,value:data_mod_freqs[i]});
                }
            }
        	//select all bars on the graph, take them out, and exit the previous data set.
        	//then you can add/enter the new data set
        	var bar = svg.selectAll(".bar")
        					.remove()
        					.exit();

            var x = d3.scaleLinear()
                    .domain(d3.extent(data))
                    .range([0, width]);

            if(mark_recapture){
                x = d3.scaleBand()
              .rangeRound([0.1*width, 0.9*width])
              .domain(data_freqs.map(function(d){
                return d.key;
              }));
            }
            if(!mark_recapture){
                var bins = d3.histogram()
                    (data);
            }else{
                var bins = d3.histogram()
                    (data);
            }

            var y = d3.scaleLinear()
                .domain([0, n])
                .range([0.9*height, 0]);

            var formatCount = d3.format(",.0f");
            if(!mark_recapture){
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

                svg.append("g")
                    .attr("class", "axis axis--x")
                    .attr("transform", "translate(0," + height*0.05 + ")")
                    .call(d3.axisBottom(x));
            } else {
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

            }

        }//end update

    }

    var TextBox = function(){
        this.bar = svg.append("g")
        .attr("transform", function(d, i) { return "translate("+width/4+"," + height/3 + ")"; })
        .attr("visibility","hidden");

        this.bar.append("rect")
            .attr("width", width/3)
            .attr("height",height/3)
            .attr("opacity",0.0)
            .attr("fill", "white");

        this.bar.append("text")
            .attr("x", width/100)
            .attr("y", height/6)
            .style("font-size", "18px")
            .attr("dy", ".35em")
            .attr("opacity",0.5)
            .text("test");
        this.show = function(){
            this.bar.moveToFront();
            this.bar.attr("visibility","visible");
        }
        this.hide = function(){
            this.bar.attr("visibility","hidden");
        }
        this.showHide = function(){
            if (this.bar.attr("visibility") == "visible"){
                this.hide();
            } else {
                this.show();
            }
        }
        this.text = function(text){
            this.bar.select("text").html(text);
        }
    }
    /* set up histogram and textbox */
    var hist = new Histogram();
    var text_box = new TextBox();

    /* set up buttons */
    if(!demo){
        var reset = function(){
            circle.each(function(d){
                d.count = 0;
                d.inside = false;
                d.c = "blue";
                d.capture = false;
                d.recapture = false;
            });
            if(mark_recapture){
                d3.select('#'+div_id+"-recapture-button").style("visibility","visible");
                first_round = true;
                second_round = false;
            }
        }
        var control = d3.select("#"+div_id).append("div");
        var btn_group = control
            .append("div")
            .attr("class","form-group")
                .append("div")
                    .attr("class","btn-group")
                    .attr("role","group");

        btn_group.append("button")
            .attr("class","btn btn-primary")
            .text("play")
            .on('click',function(){
                if(!pause){
                    pause = true;
                    d3.select(this).text('play');
                }else{
                    pause = false;
                    d3.select(this).text('pause');
                }
            });

        btn_group.append("button")
            .attr("class","btn btn-primary")
            .text("reset")
            .on('click',reset);

        btn_group.append("button")
            .attr("class","btn btn-primary")
            .text("histogram")
            .on('click',
            function(){
                if(hist.visible){
                    hist.hide();
                } else {
                    hist.show();
                }

            });

            btn_group.append("button")
                .attr("class","btn btn-primary")
                .text("stats")
                .on('click',
                function(){
                    text_box.text(function(){
                        if(!mark_recapture){
                            var obj = popEstTruncPoissNewRap(circle);
                        }else{
                            var obj = popEstimateMarkRecapture(circle);
                        }
                        var str = 'Estimates: ';
                        for(k in obj){
                            str += k + ' is ' + Math.round(obj[k] * 10)/10 + ' ';
                        }
                        return str;
                    });
                    text_box.showHide();
                });

                if(mark_recapture){
                    btn_group.append("button")
                        .attr("id",div_id+"-recapture-button")
                        .attr("class","btn btn-primary")
                        .text("recapture")

                        .on('click',
                        function(){
                            first_round = false;
                            second_round = true;
                            d3.select(this).style("visibility","hidden");
                        });
                }


        control.append("div")
                .attr("class","form-group")
                .attr("id","speed-form")
                .append("label")
                    .text("simulation speed");

        control.append("div")
                .attr("class","form-group")
                .attr("id","size-form")
                .append("label")
                    .text("population size");

        control.append("div")
                .attr("class","form-group")
                .attr("id","circle-form")
                .append("label")
                    .text("capture circle size");

        control.select("#speed-form")
            .append("input")
                .attr("id",div_id + '-speed')
                .attr("data-slider-id","speed-slider")
                .attr("type","text")
                .attr("data-slider-min","0.1")
                .attr("data-slider-max","5.0")
                .attr("data-slider-step","0.1")
                .attr("data-slider-value","0.5");

        control.select("#size-form")
            .append("input")
                .attr("id",div_id + '-size')
                .attr("data-slider-id","size-slider")
                .attr("type","text")
                .attr("data-slider-min","10")
                .attr("data-slider-max","100")
                .attr("data-slider-step","5")
                .attr("data-slider-value","10");

        control.select("#circle-form")
            .append("input")
                .attr("id",div_id + '-circle-size')
                .attr("data-slider-id","circle-size-slider")
                .attr("type","text")
                .attr("data-slider-min",0.01*width)
                .attr("data-slider-max",0.8*width)
                .attr("data-slider-step","1")
                .attr("data-slider-value",0.1*width);

        $('#' + div_id + '-speed').slider({});
        $('#' + div_id + '-size').slider({});
        $('#' + div_id + '-circle-size').slider({});

        $('#' + div_id + '-circle-size').on("change", function(slideEvt) {
        	capture_circle.attr("r",slideEvt.value.newValue);
        });


        $('#' + div_id + '-speed').on("change", function(slideEvt) {
        	sim_speed = slideEvt.value.newValue;
        });

        $('#' + div_id + '-size').on('change', function(slideEvt){
            n = slideEvt.value.newValue;
            destroyCircle();
            circleData = [];
            createCircleData(circleData,n);
            createCircle();
            updateCircle(circle);
        });
    }
    /* end of set-up control buttons */

    d3.timer(function(){
        if(!pause){
            updateCircle(circle);
        }

    },50);

    d3.timer(function(){
        circle.each(checkBoundary);
        circle.each(function(d){
            d = counterUpdate(d);
        });
        //d3.select("#pop-estimate").html(popEstimateZeroTruncated(circle).total);
    });
}

hiddenPopSim('sim');

hiddenPopSim('sim2',true);

hiddenPopSim('demo',true,true);
