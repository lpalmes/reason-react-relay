type environment;

type graphqlTag;

type recordProxy = {
  .

  /* copyFieldsFrom(source: RecordProxy): void,
     getDataID(): DataID,
     getLinkedRecord(name: string, args?: ?Variables): ?RecordProxy,
     getLinkedRecords(name: string, args?: ?Variables): ?Array<?RecordProxy>,
     getOrCreateLinkedRecord(
       name: string,
       typeName: string,
       args?: ?Variables,
     ): RecordProxy,
     getType(): string,
     getValue(name: string, args?: ?Variables): mixed,
     setLinkedRecord(
       record: RecordProxy,
       name: string,
       args?: ?Variables,
     ): RecordProxy,
     setLinkedRecords(
       records: Array<?RecordProxy>,
       name: string,
       args?: ?Variables,
     ): RecordProxy,
     setValue(value: mixed, name: string, args?: ?Variables): RecordProxy, */
};

type recordSourceSelectorProxy = {
  .
  create: (string, string) => recordProxy,
  delete: string => unit,
  get: string => option(recordProxy),
  getRoot: recordProxy,
  getRootField: string => option(recordProxy),
  getPluralRootField: string => array(option(recordProxy)),
};

type mutationConfig('variables, 'response) = {
  .
  "mutation": graphqlTag,
  "variables": 'variables,
  "onCompleted": ('response, array(string)) => unit,
  "onError": string => unit,
  "optimisticUpdater": string => unit,
  "updater": (string, string) => unit,
};

/* external commitMutation:(fun (environment: environment) (config: mutationConfig) => unit)  = "commitMutation" [@@bs.module "react-relay"]; */
module QueryRenderer = {
  type renderProps('error, 'props) = {
    .
    "error": 'error,
    "props": 'props,
  };
  [@bs.module "react-relay"]
  external queryRenderer: ReasonReact.reactClass = "QueryRenderer";
  let make =
      (
        type error,
        type props,
        ~environment: environment,
        ~query: graphqlTag,
        ~render: renderProps(error, props) => ReasonReact.reactElement,
        ~variables: 'variables,
        children,
      ) =>
    ReasonReact.wrapJsForReason(
      ~reactClass=queryRenderer,
      ~props={
        "environment": environment,
        "query": query,
        "render": render,
        "variables": variables,
      },
      children,
    );
};

[@bs.deriving abstract]
type person = {
  name: string,
  age: int,
  job: string,
};

let house = person(~name="Lorenzo", ~age=24, ~job="Developer");
let name = name(house);