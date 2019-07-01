## KillerQueen
---

A simple DSL parser and engine that enables users to quickly itterate the formulation of performance measures for the optimisation.

The language currently supports two different statements:
* Assignment
* Conditional

There are also a range of inbuilt functions:
* Min
* Max
* Abs

The mathematical capabilities are rather limited at the moment, not taking into acount any kind of precedence, or supporting bracketing.

Basic assignment:
```
$cost = 1
```

Using inbuilt functions:
```
$cost = MAX(1, 99)
```

Nested functions:
```
$cost = MAX(1, ABS(MIN(1, -99)))
```

Conditional:
```
IF (true || false) THEN $cost = 99 ELSE $cost = 100
```