---
layout: post
title: "When zombies attack: The infectious disease modelling app"
date: 2017-11-02
---
<style>
.hovereffect {
  width: 100%;
  height: 100%;
  float: left;
  overflow: hidden;
  position: relative;
  text-align: center;
  cursor: default;
}

.hovereffect .overlay {
  position: absolute;
  overflow: hidden;
  width: 80%;
  height: 80%;
  left: 10%;
  top: 10%;
  border-bottom: 1px solid #FFF;
  border-top: 1px solid #FFF;
  -webkit-transition: opacity 0.35s, -webkit-transform 0.35s;
  transition: opacity 0.35s, transform 0.35s;
  -webkit-transform: scale(0,1);
  -ms-transform: scale(0,1);
  transform: scale(0,1);
}

.hovereffect:hover .overlay {
  opacity: 1;
  filter: alpha(opacity=100);
  -webkit-transform: scale(1);
  -ms-transform: scale(1);
  transform: scale(1);
}

.hovereffect img {
  display: block;
  position: relative;
  -webkit-transition: all 0.35s;
  transition: all 0.35s;
}

.hovereffect:hover img {
  filter: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg"><filter id="filter"><feComponentTransfer color-interpolation-filters="sRGB"><feFuncR type="linear" slope="0.6" /><feFuncG type="linear" slope="0.6" /><feFuncB type="linear" slope="0.6" /></feComponentTransfer></filter></svg>#filter');
  filter: brightness(0.6);
  -webkit-filter: brightness(0.6);
}

.hovereffect h2 {
  text-transform: uppercase;
  text-align: center;
  position: relative;
  font-size: 17px;
  background-color: transparent;
  color: #FFF;
  padding: 1em 0;
  opacity: 0;
  filter: alpha(opacity=0);
  -webkit-transition: opacity 0.35s, -webkit-transform 0.35s;
  transition: opacity 0.35s, transform 0.35s;
  -webkit-transform: translate3d(0,-100%,0);
  transform: translate3d(0,-100%,0);
}

.hovereffect a, .hovereffect p {
  color: #FFF;
  padding: 1em 0;
  opacity: 0;
  filter: alpha(opacity=0);
  -webkit-transition: opacity 0.35s, -webkit-transform 0.35s;
  transition: opacity 0.35s, transform 0.35s;
  -webkit-transform: translate3d(0,100%,0);
  transform: translate3d(0,100%,0);
}

.hovereffect:hover a, .hovereffect:hover p, .hovereffect:hover h2 {
  opacity: 1;
  filter: alpha(opacity=100);
  -webkit-transform: translate3d(0,0,0);
  transform: translate3d(0,0,0);
}

.hovereffect {
    cursor: pointer;
}
</style>

I recently participated in a science outreach event where I developed a
web app to introduce infectious disease modelling to the general public. The
main idea is that there has been a recent zombie outbreak and, given some data
and models, the participant was required to investigate various hypotheses on
its transmission, estimate the transmissibility and finally simulate what types
of interventions would be required for its control.


[Here](https://sempwn.github.io/zombie-game/) is the link to the app or you can
navigate to a section of the app from the images below.

<div class="col-lg-4 col-md-4 col-sm-4 col-xs-6 clickableDiv" data-href="https://sempwn.github.io/zombie-game/">
    <div class="hovereffect">
        <img class="img-responsive" src="{{site.url}}/img/zombie_outbreak/branch.png" alt="instructions">
            <div class="overlay">
                <h2>Introduction</h2>
                <p>
                    <a href="https://sempwn.github.io/zombie-game/">Click here</a>
                </p>
            </div>
    </div>
</div>

<div class="col-lg-4 col-md-4 col-sm-4 col-xs-6 clickableDiv" data-href="https://sempwn.github.io/zombie-game/fitting.html">
    <div class="hovereffect">
        <img class="img-responsive" src="{{site.url}}/img/zombie_outbreak/curve.png" alt="estimation">
            <div class="overlay">
                <h2>Model fitting</h2>
				<p>
					<a href="https://sempwn.github.io/zombie-game/fitting.html">Click here</a>
				</p>
            </div>
    </div>
</div>
<div class="col-lg-4 col-md-4 col-sm-4 col-xs-6 clickableDiv" data-href="https://sempwn.github.io/zombie-game/simulation.html">
    <div class="hovereffect">
        <img class="img-responsive" src="{{site.url}}/img/zombie_outbreak/map.png" alt="simulation">
            <div class="overlay">
                <h2>Simulation</h2>
				<p>
					<a href="https://sempwn.github.io/zombie-game/simulation.html">Click here</a>
				</p>
            </div>
    </div>
</div>

<!-- jQuery -->
<script src="{{ site.url }}/js/jquery.min.js"></script>

<script>
$(".clickableDiv").click(function() {
  window.location = $(this).data("href");
  return false;
});
</script>
