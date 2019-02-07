// Generated by BUCKLESCRIPT VERSION 4.0.6, PLEASE EDIT WITH CARE
'use strict';

var ReasonReact = require("reason-react/src/ReasonReact.js");
var ReactRelay = require("react-relay");
var RelayRuntime = require("relay-runtime");

var Network = /* module */[];

var RecordSource = /* module */[];

var Store = /* module */[];

function make(config) {
  return new RelayRuntime.Environment({
              network: config[/* network */0],
              store: config[/* store */1]
            });
}

var Environment = /* module */[/* make */make];

var store = new RelayRuntime.RecordSource(new RelayRuntime.RecordSource());

var network = RelayRuntime.Network.create((function (operation, _) {
        console.log(operation);
        return Promise.resolve("Hello");
      }));

network.execute();

var environment = make(/* record */[
      /* network */network,
      /* store */store
    ]);

function make$1(environment, query, render, variables, children) {
  return ReasonReact.wrapJsForReason(ReactRelay.QueryRenderer, {
              environment: environment,
              query: query,
              render: render,
              variables: variables
            }, children);
}

var QueryRenderer = /* module */[/* make */make$1];

exports.Network = Network;
exports.RecordSource = RecordSource;
exports.Store = Store;
exports.Environment = Environment;
exports.store = store;
exports.network = network;
exports.environment = environment;
exports.QueryRenderer = QueryRenderer;
/* store Not a pure module */
