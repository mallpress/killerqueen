import {Node} from "./node";
import { NodeType } from "./nodetype";

export class StringConcatenation extends Node {
    public nodes:  Node[] = []
    constructor() {
        super(NodeType.StringConcatenation)
    }
}