const { Verifier } = require("@pact-foundation/pact");

const controller = require("../controllers/filmsController");

var path = require("path");

var express = require("express"),
  app = express(),
  port = process.env.PORT || 3000,
  Film = require("../models/filmModel"),
  bodyParser = require("body-parser");

const init = () => {
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  var routes = require("../routes/filmsRoutes"); //importing route
  routes(app); //register the route
  controller.init_data();
  return app.listen(port, () =>
    console.log(`Provider API listening on port ${port}...`)
  );
};

const server = init();

describe("Pruebas integración cliente", () => {
  after(() => {
    server.close();
  });
  xit("Verify Pact Insert", () => {
    let clienteInsert = {
      provider: "FilmsProvider",
      consumerVersionSelectors: [
        { consumer: "Insert Films Client", latest: true },
      ],
      providerBaseUrl: "http://localhost:3000",
      pactBrokerUrl: process.env.PACT_BROKER_URL || "http://localhost:8000",
      pactBrokerUsername: process.env.PACT_BROKER_USERNAME || "pact_workshop",
      pactBrokerPassword: process.env.PACT_BROKER_PASSWORD || "pact_workshop",
      providerVersion: "1.0.0",
      publishVerificationResult: true,
    };
    return new Verifier(clienteInsert).verifyProvider().then((output) => {
      console.log("Pact *INSERT* Verification Complete!");
      console.log(output);
    });
  });
  it("Verify Pact Normal", () => {
    let clienteNormal = {
      provider: "FilmsProvider",
      consumerVersionSelectors: [{ consumer: "FilmsClient", latest: true }],
      providerBaseUrl: "http://localhost:3000",
      pactBrokerUrl: process.env.PACT_BROKER_URL || "http://localhost:8000",
      pactBrokerUsername: process.env.PACT_BROKER_USERNAME || "pact_workshop",
      pactBrokerPassword: process.env.PACT_BROKER_PASSWORD || "pact_workshop",
      providerVersion: "1.0.0",
      publishVerificationResult: true,
      stateHandlers: {
        "Generate films": () => {
          controller.filmRepository.clear();
          controller.init_data();
        },
        "Clear repo": () => {
          controller.filmRepository.clear();
        },
        "Generate Film 999": () => {
          controller.filmRepository.insert(
            new Film(999, "Film To Delete", "To DELETE", "2020")
          );
        },
      },
    };

    return new Verifier(clienteNormal).verifyProvider().then((output) => {
      console.log("Pact *NORMAL* Verification Complete!");
      console.log(output);
    });
  });
});
