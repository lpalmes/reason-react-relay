import {
  ASTNode,
  RecordNode,
  RecordScalar,
  ScalarNode,
  ScalarPrimitive,
  UnionNode
} from "./ReasonASTTypes";

function printScalarPrimitive(node: ScalarPrimitive) {
  switch (node) {
    case "String":
      return "string";
    case "Int":
      return "int";
    case "Float":
      return "float";
    case "Boolean":
      return "bool";
  }
}

function printScalar(node: ScalarNode): string {
  switch (node.kind) {
    case "scalar":
      return printScalarPrimitive(node.value);
    case "scalar-optional":
      return "option(" + printScalar(node.value) + ")";
    case "scalar-array":
      return "list(" + printScalar(node.value) + ")";
    case "scalar-reference":
      return node.value;
  }
  return "";
}

function printRecordScalar(node: RecordScalar): string {
  let scalar = "";
  scalar += "  " + node.key + ": " + printScalar(node.value) + ",";
  return scalar;
}

function printRecord(node: RecordNode): string {
  let record = "";
  record += "type " + node.name + " = {\n";
  record += node.nodes.map(printRecordScalar).join("\n");
  record += "\n};";
  return record;
}

function printUnion(node: UnionNode): string {
  let union = "";
  union += "type " + node.name + " = ";
  node.nodes.forEach(n => {
    union += "\n  | " + n;
  });
  union += ";";
  return union;
}

export function printReason(nodes: ReadonlyArray<ASTNode>): string {
  return nodes
    .map(n => {
      switch (n.kind) {
        case "union":
          return printUnion(n);
        case "record":
          return printRecord(n);
      }
    })
    .join("\n\n");
}

const dateRecord: RecordNode = {
  kind: "record",
  name: "date",
  nodes: [
    {
      kind: "record-scalar",
      key: "day",
      value: {
        kind: "scalar",
        value: "Int"
      }
    },
    {
      kind: "record-scalar",
      key: "month",
      value: {
        kind: "scalar",
        value: "Int"
      }
    },
    {
      kind: "record-scalar",
      key: "year",
      value: {
        kind: "scalar",
        value: "Int"
      }
    }
  ]
};

const userRecord: RecordNode = {
  kind: "record",
  name: "user",
  nodes: [
    {
      kind: "record-scalar",
      key: "name",
      value: {
        kind: "scalar",
        value: "String"
      }
    },
    {
      kind: "record-scalar",
      key: "age",
      value: {
        kind: "scalar-optional",
        value: {
          kind: "scalar-array",
          value: {
            kind: "scalar-optional",
            value: {
              kind: "scalar-reference",
              value: "date"
            }
          }
        }
      }
    }
  ]
};

const unionAst: UnionNode = {
  kind: "union",
  name: "elements",
  nodes: ["Blue", "Red", "Yellow"]
};
const printed = printReason([unionAst, dateRecord, userRecord]);
