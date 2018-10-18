import * as TypescriptGenerator from "./../TypeScriptGenerator";
// @ts-ignore
import { generateTestsFromFixtures } from "relay-test-utils/lib/RelayModernTestUtils";
// @ts-ignore
import * as RelayTestSchema from "relay-test-utils/lib/RelayTestSchema";
// @ts-ignore
import * as parseGraphQLText from "relay-test-utils/lib/parseGraphQLText";

import {
  // @ts-ignore
  GraphQLCompilerContext,
  IRTransforms,
  // @ts-ignore
  transformASTSchema
} from "relay-compiler";

import * as ReasonGenerators from "./ReasonGenerator";

const text = `
query ExampleQuery($id: ID!) {
  node(id: $id) {
    id
    name
    username
    canViewerComment
    url(relative: true, site: "google.com")
    trait
  }
}

# fragment ExampleFragment on User {
#   id
# }

# mutation TestMutation($input: CommentCreateInput!) {
#   commentCreate(input: $input) {
#     comment {
#       id
#     }
#   }
# }

# subscription TestSubscription($input: FeedbackLikeInput) {
#   feedbackLikeSubscribe(input: $input) {
#     feedback {
#       id
#     }
#   }
# }

# fragment ScalarField on User {
#   id
#   name
#   websites
#   traits
#   aliasedLinkedField: birthdate {
#     aliasedField: year
#   }
#   screennames {
#     name
#     service
#   }
# }
`;

const schema = transformASTSchema(RelayTestSchema, [
  IRTransforms.schemaExtensions[1] // RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
]);
const { definitions } = parseGraphQLText(schema, text);
new GraphQLCompilerContext(RelayTestSchema, schema)
  .addAll(definitions)
  .applyTransforms(ReasonGenerators.transforms)
  .documents()
  .forEach((doc: any) => {
    const generated = ReasonGenerators.generate(doc, {
      customScalars: {},
      enumsHasteModule: null,
      existingFragmentNames: new Set(["PhotoFragment"]),
      inputFieldWhiteList: [],
      relayRuntimeModule: "relay-runtime",
      useSingleArtifactDirectory: false,
      useHaste: true
    });

    console.log(generated);
    const tsgenerated = TypescriptGenerator.generate(doc, {
      customScalars: {},
      enumsHasteModule: null,
      existingFragmentNames: new Set(["PhotoFragment"]),
      inputFieldWhiteList: [],
      relayRuntimeModule: "relay-runtime",
      useSingleArtifactDirectory: false,
      useHaste: true
    });

    console.log(tsgenerated);
    return generated;
  });
