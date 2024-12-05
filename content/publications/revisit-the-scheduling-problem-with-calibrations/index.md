---
title: Revisit the Scheduling Problem with Calibrations
summary: Lin Chen, Yixiong Gao, Minming Li, Guohui Lin, and Kai Wang (2024). In 35th International Symposium on Algorithms and Computation (ISAAC 2024).
date: 2024-12-04
tags:
  - ISAAC
---

[Lin Chen](https://orcid.org/0000-0003-3909-4916), [**Yixiong Gao**](https://yixionggao.com/), [Minming Li](https://www.cs.cityu.edu.hk/~minmli/), [Guohui Lin](https://webdocs.cs.ualberta.ca/~ghlin/), and [Kai Wang](https://orcid.org/0000-0002-6455-485X). 

In 35th International Symposium on Algorithms and Computation (ISAAC 2024).

[[DOI](https://doi.org/10.4230/LIPIcs.ISAAC.2024.20)] [[PDF](/publications/revisit-the-scheduling-problem-with-calibrations/LIPIcs.ISAAC.2024.20.pdf)] [[Slides]()]

**Abstract**

The research about scheduling with calibrations was initiated from the Integrated Stockpile Evaluation (ISE) program which tests nuclear weapons periodically. The tests for these weapons require calibrations that are expensive in the monetary sense. This model has many industrial applications where the machines need to be calibrated periodically to ensure high-quality products, including robotics and digital cameras. In 2013, Bender et al. (SPAA '13) proposed a theoretical framework for the ISE problem. In this model, a machine can only be trusted to run a job when it is calibrated and the calibration remains valid for a time period of length T, after which it must be recalibrated before running more jobs. The objective is to find a schedule that completes all jobs by their deadlines and minimizes the total number of calibrations. In this paper, we study the scheduling problem with calibrations on multiple parallel machines where we consider unit-time processing jobs with release times and deadlines. We propose a dynamic programming algorithm with polynomial running time when the number of machines is constant. Then, we propose another dynamic programming approach with polynomial running time when the length of the calibrated period is constant. Also, we propose a PTAS, that is, for any constant ε > 0, we give a (1+ε) - approximation solution with m machines.

