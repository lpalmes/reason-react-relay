import * as ts from "typescript";

import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLType,
  GraphQLUnionType
} from "graphql";

import { TypeGeneratorOptions } from "relay-compiler";
import { RecordNode, ScalarNode } from "./Printer/ReasonASTTypes";
import { typeCase } from "./utils";

export type ScalarTypeMapping = {
  [type: string]: string;
};

export type State = {
  generatedRecords: RecordNode[];
  usedEnums: { [name: string]: GraphQLEnumType };
  usedFragments: Set<string>;
  generatedInputObjectTypes: {
    [name: string]: ts.TypeNode | "pending";
  };
  generatedFragments: Set<string>;
} & TypeGeneratorOptions;

function getInputObjectTypeIdentifier(type: GraphQLInputObjectType): string {
  return type.name;
}

export function transformScalarType(
  type: GraphQLType,
  state: State,
  objectProps?: ts.TypeNode
): ScalarNode {
  if (type instanceof GraphQLNonNull) {
    return transformNonNullableScalarType(type.ofType, state, objectProps);
  } else {
    return {
      kind: "scalar-optional",
      value: transformNonNullableScalarType(type, state, objectProps)
    };
  }
}

function transformNonNullableScalarType(
  type: GraphQLType,
  state: State,
  objectProps?: ts.TypeNode
): ScalarNode {
  if (type instanceof GraphQLList) {
    return {
      kind: "scalar-array",
      value: transformScalarType(type.ofType, state, objectProps)
    };
  } else if (
    type instanceof GraphQLObjectType ||
    type instanceof GraphQLUnionType ||
    type instanceof GraphQLInterfaceType
  ) {
    return {
      kind: "scalar-reference",
      value: type.name.charAt(0).toLowerCase() + type.name.slice(1)
    };
  } else if (type instanceof GraphQLScalarType) {
    return transformGraphQLScalarType(type, state);
  } else if (type instanceof GraphQLEnumType) {
    return transformGraphQLEnumType(type, state);
  } else {
    throw new Error(`Could not convert from GraphQL type ${type.toString()}`);
  }
}

function transformGraphQLScalarType(
  type: GraphQLScalarType,
  state: State
): ScalarNode {
  switch (state.customScalars[type.name] || type.name) {
    case "ID":
    case "String":
    case "Url":
      return {
        kind: "scalar",
        value: "String"
      };
    case "Float":
      return {
        kind: "scalar",
        value: "Float"
      };
    case "Int":
      return {
        kind: "scalar",
        value: "Int"
      };
    case "Boolean":
      return {
        kind: "scalar",
        value: "Boolean"
      };
    default:
      return {
        kind: "scalar",
        value: "String"
      };
  }
}

function transformGraphQLEnumType(
  type: GraphQLEnumType,
  state: State
): ScalarNode {
  state.usedEnums[type.name] = type;
  return {
    kind: "scalar-reference",
    value: typeCase(type.name)
  };
}

export function transformInputType(
  type: GraphQLInputType,
  state: State
): ts.TypeNode {
  if (type instanceof GraphQLNonNull) {
    return transformNonNullableInputType(type.ofType, state);
  } else {
    return ts.createUnionTypeNode([
      transformNonNullableInputType(type, state),
      ts.createKeywordTypeNode(ts.SyntaxKind.NullKeyword)
    ]);
  }
}

function transformNonNullableInputType(type: GraphQLInputType, state: State) {
  if (type instanceof GraphQLList) {
    return ts.createTypeReferenceNode(ts.createIdentifier("ReadonlyArray"), [
      transformInputType(type.ofType, state)
    ]);
  } else if (type instanceof GraphQLScalarType) {
    return transformGraphQLScalarType(type, state);
  } else if (type instanceof GraphQLEnumType) {
    return transformGraphQLEnumType(type, state);
  } else if (type instanceof GraphQLInputObjectType) {
    const typeIdentifier = getInputObjectTypeIdentifier(type);
    if (state.generatedInputObjectTypes[typeIdentifier]) {
      return ts.createTypeReferenceNode(
        ts.createIdentifier(typeIdentifier),
        []
      );
    }
    state.generatedInputObjectTypes[typeIdentifier] = "pending";
    const fields = type.getFields();

    const props = Object.keys(fields)
      .map(key => fields[key])
      .filter(field => state.inputFieldWhiteList.indexOf(field.name) < 0)
      .map(field => {
        const property = ts.createPropertySignature(
          [ts.createToken(ts.SyntaxKind.ReadonlyKeyword)],
          ts.createIdentifier(field.name),
          !(field.type instanceof GraphQLNonNull)
            ? ts.createToken(ts.SyntaxKind.QuestionToken)
            : undefined,
          transformInputType(field.type, state),
          undefined
        );
        return property;
      });
    state.generatedInputObjectTypes[typeIdentifier] = ts.createTypeLiteralNode(
      props
    );
    return ts.createTypeReferenceNode(ts.createIdentifier(typeIdentifier), []);
  } else {
    throw new Error(
      `Could not convert from GraphQL type ${(type as GraphQLInputType).toString()}`
    );
  }
}
