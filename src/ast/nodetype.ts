export enum NodeType {
    Branch = "Branch",
    Condition = "Condition",
    ConditionGroup = "ConditionGroup",
    Aggregate = "Aggregate",
    Operation = "Operation",
    Sequence = "Sequence",
    FunctionCall = "FunctionCall",
    PropertyAccess = "PropertyAccess",
    Identifier = "Identifier",
    StringLiteral = "StringLiteral",
    NumericLiteral = "NumericLiteral",
    BooleanLiteral = "BooleanLiteral",
}