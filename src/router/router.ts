import express from "express";
import controller from "../controller/controller";
import Service from "../service/service";

const router = express.Router();

export default (service:Service): express.Router => {
  router.get("/", controller.health);
  router.get("/ping", controller.ping);
  router.post("/set", (req, res)=>controller.set(req, res, service));
  router.get("/get", (req, res)=>controller.get(req, res, service));
  router.delete("/delete", (req, res)=>controller.del(req, res, service));
  router.get("/getall", (req, res)=>controller.getAll(req, res, service));
  router.delete("/flush", (req, res)=>controller.flush(req, res, service));
  router.post("/close", (req, res)=>controller.close(req, res, service))
  return router;
};
