instance variable are accessed using the $ prefix
extension properties are accessed against an element
all elements are referenced using the same identifier 'el' so as to remove the need to know the subtype
code is line delimited? annoying untill we have the multi line text things
we probably need to support if statements

functions available are:
    MAX(val1, val2)
    MIN(val1, val2)
    ABS(val)

    for these functions will probably have to interceed if either prarameter is null/undefined



** NOTES **
this will only work in projects that have unique element ids per base type, not sub type
we should be able to easily set it up to handle multi instance setups for using working data
    in fruchocs we probably need the user to determine what is in put and what is output
    this way we can handle getting inputs directly from the referenced el, and pushing results to the working data is a thing

do we want to handle set time ? ... probably


proposed workflow
    1. specify model
    2. choose element thats going to be used
    3. create instance props
    4. create extension props for elements
    5. select which lifecycle events will have lambdas
    6. maybe enter default lambdas?


reserved words:
    $cost
    el

examples

$cost = MAX(el.pressure - $threshold, $cost)
IF (el.pressure >= $threshold) THEN el.thresholdBreached = true; el.maxPressure = MAX(el.maxPressure, el.pressure) END


do we allow temp vars?

like 
$a = 1
IF (el.removed) THEN $a = 2 ELSE $a = 3 END
$cost += $a




for decisions????