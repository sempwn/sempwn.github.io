---
layout: post
title: "Measuring hidden populations"
date: 2017-09-05
---

<style>

.bar rect {
  fill: steelblue;
}

.bar text {
  fill: #fff;
  font: 10px sans-serif;
}

</style>

<figure class="figure">
    <img class="center-block img-responsive" src ="{{site.url}}/img/hidden_pop/cat.jpg" alt="complex models" />
    <figcaption class="figure-caption text-center">
    <a href="https://www.flickr.com/photos/83613432@N02/8257427196/in/photolist-dzFtqq-9TJEtN-S9iPAL-fBxxcz-4dr7ba-VF1XSV-2wabB-8yhtUw-rqfwx-5LWXVp-dXMfvk-huuB91-qZD7X9-dEFtkj-8uYCTR-6cdS9r-9BJArW-obqCLX-nRvggo-gWefq-aohS4v-9GSk2N-bmEZdU-9Mt6Yw-A8Ush-jZwHdv-5T3vWi-rwgu8V-qHYvyr-bZMUa1-SovhJw-frbsN-4Fy9rU-gWeey-QJp1sp-PT4pw-rdr7va-6Xgfjr-fc6Bg7-5pe6hY-scNmY-4TzqwM-cg2brA-6Csnwt-5m47cs-nwZRvp-4XZL1G-6oof9c-h6T5GF-hUNpb">Cat hiding.</a>
    </figcaption>
</figure>

Often the data that comes to us is only partially observed: website users out of
all potential customers, patients displaying symptoms out of a total population
of infected individuals, the number of animals observed in a study etc. One of
the challenges with this type of data is to be able to determine the size and
characteristics of the total population based on our ([hopefully unbiased](https://en.wikipedia.org/wiki/Sampling_bias#Historical_examples))
sample.

How we can determine what the size is based on the type of data we observe? We'll
look at two examples here: the zero-truncated count data and mark-recapture
data. Zero-truncated data comes about when we observe the same individuals multiple
times (but obviously don't measure the individuals we don't see). For example
from a [health registry](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4011782/),
[police arrest records](http://onlinelibrary.wiley.com/doi/10.1111/1467-9574.00232/abstract)
or [number of non-clonal tomato plants](http://www.personal.soton.ac.uk/dab1f10/jrssc.pdf).

Mark-recapture data is slightly different. Here there are two or more distinct phases
or surveys in the observations and the number detected in each survey plus the
overlap is used to estimate the whole population. Traditionally these techniques
are used in ecology, where an animal is marked or tagged and released and then
recaptured at a later date (e.g. measuring a population of [tigers](http://onlinelibrary.wiley.com/doi/10.1890/0012-9658%282006%2987%5B2925:ATPDUP%5D2.0.CO;2/full)).
These techniques are also used where individuals may be captured by different data
sources, such as in estimating prevalence of [injection drug use](http://jech.bmj.com/content/58/9/766.short).

Let's explore these concepts with a simulation. Below is our "field" with
individuals of a species (circles) moving around randomly. In the centre is
a larger circle denoting our field of view. If an individual wanders into our
field of view then we measure it (denoted by a change of colour). However, we
can't directly observe the individuals outside the field of view who haven't been
measured already. You can see that it would take a long time for all individuals
to wander into the field of view making it impractical to view all individuals
this way.

<div id="demo"></div>

### Zero-truncated poisson

First we can imagine that we record the number of times each individual wanders
into our field of view. We can use these statistics to build up an estimate of
the total population by making some assumptions around how these counts are distributed.
Assuming there's a small, but constant probability of any individual wandering into
the field of view at any time leads to a Poisson distribution of counts i.e. the probability
of a randomly sampled (from the entire population) individual's count being $x$ is

### $$P(X = x) = \frac{e^{-\lambda}x^\lambda}{x!}.$$

However, we don't observe the individuals with zero counts so our data is truncated.
The probability of not being observed ($p_0$) is $e^{-\lambda}$.
Therefore the probability of a random variate $X$ being observed $x$ times is

### $$P(X = x | X > 0) = \frac{P(X=x)}{P(X>0)} =  \frac{x^\lambda}{x!} \frac{e^{-\lambda}}{1-e^{-\lambda}}$$

For our data $\{x_0,\ldots,x_{n-1} \}$, the associated log-likelihood is

### $$-n\lambda -n\log(1-e^{-\lambda}) +  \lambda \sum_{i=0}^{n-1}\log(x_i) -\sum_{i=0}^{n-1}\log(x_i!)$$

Using the zero-truncated Poisson model, we can estimate the odds ratio of being
observed against not being observed, $p_0/(1-p_0)$. We can calculate this empirically
if we knew the number of individuals who weren't observed ($f_0$) divided by the number
that were observed ($N_{obs}$). Combining these together we get the following,

### $$\hat{f_0} = \frac{p_0}{1-p_0}N_{obs}.$$

So now all we need is an estimate of $\lambda$. We can do this by maximizing the
likelihood. The tool below shows this in action, notice that for this estimator
to work you need to have viewed at least one individual twice or more.
Notice that the estimator isn't dependent on the size of the capture circle as
this is incorporated into the rate $\lambda$.

<div id="sim"></div>



### Mark recapture

We now look at a slightly different type of study where there a two distinct phases
of measuring a population. In an ecological study this could be where an initial
survey is conducted to measure the population size of a particular species and
each individual is tagged. At a later stage the population is measured again and the
number of individuals as well as the number of tagged individuals are recorded.

Let's set-up some notation for the problem: $N$ is the unknown total population size,
$n$ is the number of individuals marked in the first survey, $K$ is the number of individuals
observed in the second survey and $k$ is the number of individuals observed in the
second survey who were tagged in the first survey.

A simple estimator of the population size known as the [Lincoln estimator](https://en.wikipedia.org/wiki/Lincoln_index)
(although why it's called this is a slight [mystery](http://bit-player.org/2010/the-thrill-of-the-chase) and
is probably an example of [Stigler's law of eponymy](https://en.wikipedia.org/wiki/Stigler%27s_law_of_eponymy)).
This estimator assumes that the probability of being observed in the second
survey is the same as in the first survey. The empirical probability of being
observed in the first survey is $n/N$ and the probability of being observed again is
$k/K$. If these two probabilities are independent we can equate them and get the
following estimator

### $$\hat{N} = \frac{nK}{k}.$$

It turns out this only performs well for large sample sizes. For smaller sample
sizes we can use the Chapman estimator:

### $$\hat{N} = \frac{(n+1)(K+1)}{k+1} - 1.$$

Use the tool below to explore these estimators with our simulation.

<div id="sim2"></div>

You can see under what conditions the Chapman estimator outperforms the Lincoln
estimator. Although with both we have no estimate of the uncertainty around them.
If we wanted to actually put this into practice then we might consider something
like the R package [multimark](https://cran.r-project.org/web/packages/multimark/index.html)
or in Python using [PyMC](http://docs.pymc.io) (e.g. this [example](https://github.com/pymc-devs/pymc/wiki/Mt)).

### Acknowledgements

All the interactive examples were coded in [d3](https://d3js.org), which has many fantastic [examples](https://bl.ocks.org) for
data visualization.


<!-- jQuery -->
<script src="{{ site.url }}/js/jquery.min.js"></script>

<!-- Plugin JavaScript -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.3/jquery.easing.min.js"></script>

<!-- d3 js v4 -->
<script src="https://d3js.org/d3.v4.min.js"></script>

<!-- numeric -->
<script src="{{ site.url }}/js/numeric.js"></script>

<!-- Plotly.js -->
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>

<!-- slider -->
<script src="{{ site.url }}/js/bootstrap-slider.js"></script>

<!-- venn -->
<script src="{{ site.url }}/js/venn.js"></script>



<!-- main js -->
<script src="{{ site.url }}/js/capture.js"></script>
