import React from "react";
import { hydrate } from "react-dom";
import { ApolloProvider } from "react-apollo";
// import { ApolloProvider } from "@apollo/react-hooks";
import { BrowserRouter } from "react-router-dom";
import client from "../shared/apolloClient";
import App from "./App";
import config from "../config";
import { TypeSettings } from "./types";

declare global {
  interface Window {
    ga: () => void;
    __INITIAL_DATA__: {
      settings: TypeSettings;
      themeSettings: [];
      data: null;
    };
  }
}

let initialData = {
  settings: {},
  themeSettings: [],
  data: null,
};
if (window.__INITIAL_DATA__) {
  initialData = window.__INITIAL_DATA__;
}

const LetterpadClient = (
  <BrowserRouter basename={config.baseName}>
    <ApolloProvider client={client()}>
      <App initialData={initialData} />
    </ApolloProvider>
  </BrowserRouter>
);

hydrate(LetterpadClient, document.getElementById("app"));
