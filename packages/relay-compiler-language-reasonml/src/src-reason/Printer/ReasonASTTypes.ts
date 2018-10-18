export type ScalarPrimitive = "String" | "Int" | "Float" | "Boolean";

export interface Scalar {
  kind: "scalar";
  value: ScalarPrimitive;
}

export interface ScalarOptional {
  kind: "scalar-optional";
  value: ScalarNode;
}

export interface ScalarArray {
  kind: "scalar-array";
  value: ScalarNode;
}

export interface ScalarReference {
  kind: "scalar-reference";
  value: string;
}

export type ScalarNode =
  | Scalar
  | ScalarOptional
  | ScalarArray
  | ScalarReference;

export interface RecordScalar {
  kind: "record-scalar";
  key: string;
  value: ScalarNode;
}

export interface RecordNode {
  kind: "record";
  name: string;
  nodes: ReadonlyArray<RecordScalar>;
}

export interface UnionNode {
  kind: "union";
  name: string;
  nodes: ReadonlyArray<string>;
}

export type ASTNode = RecordNode | UnionNode;
