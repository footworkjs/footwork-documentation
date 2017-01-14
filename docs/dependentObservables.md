---
layout: documentation
title: Dependent Observables
---

Since Footwork 2.0, dependent observables are now called *computed observables*. You can find documentation for them [here](computedObservables.md).

Note that this rename does not cause any backward compatibility problems. At runtime, `fw.dependentObservable` refers to the same function as `fw.computed`, so your existing code will continue to work just fine.