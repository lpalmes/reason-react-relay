module Network = {
  type network;

  type fetchFunction = (unit, unit) => Js.Promise.t(string);

  [@bs.module "relay-runtime"] [@bs.scope "Network"]
  external make: fetchFunction => network = "create";

  [@bs.send] external execute: network => Js.Promise.t(string) = "";
};

module RecordSource = {
  type recordSource;

  [@bs.module "relay-runtime"] [@bs.new]
  external make: unit => recordSource = "RecordSource";
};

module Store = {
  type store;

  [@bs.module "relay-runtime"] [@bs.new]
  external make: RecordSource.recordSource => store = "RecordSource";
};

module Environment = {
  type environment;

  type config = {
    network: Network.network,
    store: Store.store,
  };

  type configJs = {
    .
    "network": Network.network,
    "store": Store.store,
  };

  [@bs.module "relay-runtime"] [@bs.new]
  external makeEnvironment: configJs => environment = "Environment";

  let make = config =>
    makeEnvironment({"network": config.network, "store": config.store});
};

let store = Store.make(RecordSource.make());

let network =
  Network.make((operation, _) => {
    Js.log(operation);
    Js.Promise.(resolve("Hello"));
  });

Network.execute(network);
let environment = Environment.make({network, store});

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

[@bs.module "react-relay"]
external commitMutation:
  (Environment.environment, mutationConfig('variables, 'response)) => unit =
  "commitMutation";

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
        ~environment: Environment.environment,
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