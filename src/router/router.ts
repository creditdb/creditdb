import express from "express";
import controller from "../controller/controller";

const router = express.Router();

export default (): express.Router => {
  router.get("/", controller.ping);
  router.post("/set", controller.set);
  router.get("/get/:key", controller.get);
  router.get("/getall", controller.getAll);
  router.post("/page", controller.page);
  router.get("/page", controller.getPage);
  router.post("/flush", controller.flush);
  router.post("/close", controller.close)
  return router;
};
