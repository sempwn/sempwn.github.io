---
layout: post
title: "Using Gaussian processes to predict elections"
date: 2020-11-07
---

---

### Idea

Often for time-series analysis we want to be able to incorporate useful information about the correlation structure of the data in order to try and get at the underlying dynamics. We can consider the following model structure for such data, $$X$$ we have

$$ X \sim N(0,\Sigma) $$

### Implementation

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
```
