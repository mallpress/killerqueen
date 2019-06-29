import {Node} from "./node";
import { BooleanOperator } from "./booleanoperator";
import { NodeType } from "./nodetype";
import { Identifier } from "./identifier";
import { PropertyAccess } from "./propertyaccess";

export class Condition extends Node {
    public ref: Identifier | PropertyAccess
    public operator: BooleanOperator
    public value: any
    constructor(ref: Identifier | PropertyAccess, operator: BooleanOperator, value: any) {
        super(NodeType.Expression)
        this.ref = ref
        this.operator = operator
        this.value = value
    }
}