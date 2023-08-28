import { Request, Response } from "express";
import logger from "../utils/logger";
import Service from "../service/service";
import { ILine, IMeta } from "../model/model";
import { closeBook } from "../repo/repo";
import serverManager from "../servermanager/server.manager";
import { validate, IsNotEmpty, IsString, IsNumber } from "class-validator";

class LineInput {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsString()
  value: string;

  constructor(key: string, value: string) {
    this.key = key;
    this.value = value;
  }
}

class PageInput {
  @IsNotEmpty()
  @IsNumber()
  page: number;

  constructor(page: number) {
    this.page = page;
  }
}
const service = new Service(0);

const set = async (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;

    const lineInput = new LineInput(key, value);
    const errors = await validate(lineInput);
    if (errors.length > 0) {
      throw new Error("input validation failed");
    }
    const line: ILine = {
      key: key,
      value: value,
      Meta: {} as IMeta,
    };
    logger.info(`set key: ${key}, value: ${value}`);
    res.send({ status: 200, ...(await service.setLine(line)) });
  } catch (err:any) {
    logger.error(err.message);
    res.statusCode = 400;
    res.send({ status: "ERROR", error: err.message });
  }
};

const get = async (req: Request, res: Response) => {
  try {
    const { key } = req.body;
    logger.info(`get key: ${key}`);
    const result = await service.getLine(key);
    res.send({ status: "OK", ...result });
  } catch (err:any) {
    logger.error(err.message);
    res.statusCode = 404;
    res.send({ status: "ERROR", error: err.message });
  }
};



const del= async (req: Request, res: Response) => {
  try {
    const { key } = req.body;
    logger.info(`delete key: ${key}`);
    await service.deleteLine(key);
    res.send({ status: "OK"});
  } catch (err:any) {
    logger.error(err.message);
    res.statusCode = 404;
    res.send({ status: "ERROR", error: err.message });
  }
};

const getAll = async (req: Request, res: Response) => {
  try {
    const result = await service.getAllLines();
    const page = await service.getPage();
    logger.info(`getAll page: ${page}`);
    res.send({ status: "OK", page, result });
  } catch (err:any) {
    logger.error(err.message);
    res.statusCode = 404;
    res.send({ status: "ERROR", error: err.message });
  }
};

const page = async (req: Request, res: Response) => {
  try {
    const { page } = req.body;
    const pageInput = new PageInput(page);
    const errors = await validate(pageInput);
    if (errors.length > 0) {
      throw new Error("input validation failed");
    }
    logger.info(`page: ${page}`);
    await service.setPage(Number(page));
    res.status(200).send({ status: "OK", page: page });
  } catch (err:any) {
    logger.error(err.message);
    res.status(400).send({ status: "ERROR", error: err.message });
  }
};

const getPage = async (req: Request, res: Response) => {
  try {
    const page = await service.getPage();
    logger.info(`getPage: ${page}`);
    res.status(200).send({ status: "OK", page });
  } catch (err:any) {
    logger.error(err.message);
    res.status(500).send({ status: "ERROR", error: err.message });
  }
};

const flush = async (req: Request, res: Response) => {
  try {
    await service.flush();
    const page = await service.getAllLines();
    if (page.length > 0) {
      throw new Error("page not flushed");
    }
    const pagenumber = await service.getPage();
    logger.info(`flushed page: ${pagenumber}`);
    res.status(200).send({ status: "OK", page, pagenumber });
  } catch (err: any) {
    logger.error(err.message);
    res.status(500).send({ status: "ERROR", error: err.message });
  }
};

const ping = async (req: Request, res: Response) => {
  logger.info(`pong`);
  res.status(200).send({status: "OK", ping: "pong"});
};

const health = async (req: Request, res: Response) => {
  logger.info(`health`);
  res.status(200).send({status: "OK"});
};
const close = async (req: Request, res: Response) => {
  try {
    closeBook();
    res.send({ status: "OK" });
    serverManager.closeServer();
  } catch (err:any) {
    logger.error(err.message);
    res.statusCode = 500;
    res.send({ status: "ERROR", error: err.message });
  }
};

const Controller = {
  set,
  get,
  del,
  page,
  ping,
  getAll,
  getPage,
  flush,
  close,
  health,
};
export default Controller;
