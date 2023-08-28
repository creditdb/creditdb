import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import compression from "compression";
import config from "config";
import logger from "../utils/logger";
import { closeBook } from "../repo/repo";
import router from "../router/router";
import jsonParsingMiddleware from "../controller/middleware";

const port: number = config.get("port");
const app = express();

app.use(
  cors({
    origin: "http://localhost:" + port, // Replace with your allowed origin(s)
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
  })
);
app.use(compression());
app.use(bodyParser.json());
app.use(jsonParsingMiddleware);
app.use(express.json());
const server = http.createServer(app);

app.use("/", router());
const startServer = () => {
  try {
    server.listen(port, () => {
      logger.info("CreditDB Server is listening on http://localhost:" + port);
    });
  } catch (err: any) {
    logger.error("Error starting server", err.message);
    process.exit(1);
  }
};

const closeServer = () => {
  server.close(() => {
    try {
      closeBook();
      logger.info("Server has closed gracefully.");
      process.exit(0);
    } catch (err: any) {
      logger.error(err.message);
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => {
  logger.info("Received SIGTERM signal. Closing gracefully...");
  closeServer();
});

process.on("SIGINT", () => {
  logger.info("Received SIGINT signal. Closing gracefully...");
  closeServer();
});

export default {
  startServer,
  closeServer,
};
