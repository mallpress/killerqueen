import {Node} from "./node";
import { Sequence } from "./sequence";
import { NodeType } from "./nodetype";

export class Branch extends Node {
    public condition: Node;
    public condTrueBody: Sequence;
    public condFalseBody?: Sequence;

    public constructor(condition: Node, condTrueBody: Sequence, condFalseBody?: Sequence) {
        super(NodeType.Branch)
        this.condition = condition
        this.condTrueBody = condTrueBody
        this.condFalseBody = condFalseBody
    }
}