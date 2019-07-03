## KillerQueen
---

A simple DSL parser and engine that enables users to quickly itterate the formulation of performance measures for the optimisation.

The language currently supports three different statements:
* Assignment
* Conditional
* For / For Each Loops

There are also a range of inbuilt functions:
* Min
* Max
* Abs
* Ceil(ing)
* Floor

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

For Loop: ($val being the current itteration value)
```
FOR ($count + 5) $cost = $val
```

For Each Loop: (arrays supporting only string / numeric literals)
```
FOR EACH [0,1,2,3] $cost = $val
```