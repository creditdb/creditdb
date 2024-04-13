//controller/controller.ts

import { Request, Response } from "express";
import logger from "../utils/logger";
import Service from "../service/service";
import { ILine, IMeta } from "../model/model";
import { closeBook } from "../repo/repo";
import serverManager from "../servermanager/server.manager";
import { validate, IsNotEmpty, IsString, IsNumber, IsInt, Min } from "class-validator";

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
  @Min(0)
  @IsInt()
  page: number;

  constructor(page: number) {
    this.page = page;
  }
}

const set = async (req: Request, res: Response, service: Service) => {
  try {
    const { key, value, page } = req.body;
    
    const pageInput = new PageInput(page);
    const pageErrors = await validate(pageInput);
    if (pageErrors.length > 0) {
      throw new Error("page input validation failed");
    }
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
    const pagenumber = Number(page)
    res.send({ status: 200, ...(await service.setLine(pagenumber,line)) });
  } catch (err: any) {
    logger.error(err.message);
    res.statusCode = 400;
    res.send({ status: "ERROR", error: err.message });
  }
};

const get = async (req: Request, res: Response, service: Service) => {
  try {
    const { key, page } = req.body;
    const pageInput = new PageInput(page);
    const pageErrors = await validate(pageInput);
    if (pageErrors.length > 0) {
      throw new Error("page input validation failed");
    }
    logger.info(`get key: ${key}`);
    const pagenumber = Number(page)
    const result = await service.getLine(pagenumber,key);
    res.send({ status: "OK", ...result });
  } catch (err: any) {
    logger.error(err.message);
    res.statusCode = 404;
    res.send({ status: "ERROR", error: err.message });
  }
};

const del = async (req: Request, res: Response, service: Service) => {
  try {
    const { key, page } = req.body;
    
    const pageInput = new PageInput(page);
    const pageErrors = await validate(pageInput);
    if (pageErrors.length > 0) {
      throw new Error("page input validation failed");
    }
    logger.info(`delete key: ${key}`);
    const pagenumber = Number(page)
    await service.deleteLine(pagenumber, key);
    res.send({ status: "OK" });
  } catch (err: any) {
    logger.error(err.message);
    res.statusCode = 404;
    res.send({ status: "ERROR", error: err.message });
  }
};

const getAll = async (req: Request, res: Response, service: Service) => {
  try {
    const { page } = req.body;
    const pageInput = new PageInput(page);
    const pageErrors = await validate(pageInput);
    if (pageErrors.length > 0) {
      throw new Error("page input validation failed");
    }
    const pagenumber = Number(page)
    const result = await service.getAllLines(pagenumber);
    logger.info(`getAll page: ${page}`);
    res.send({ status: "OK", pagenumber, result });
  } catch (err: any) {
    logger.error(err.message);
    res.statusCode = 404;
    res.send({ status: "ERROR", error: err.message });
  }
};


const flush = async (req: Request, res: Response, service: Service) => {
  try {
    const { page } = req.body;
    const pageInput = new PageInput(page);
    const pageErrors = await validate(pageInput);
    if (pageErrors.length > 0) {
      throw new Error("page input validation failed");
    }
    const pagenumber = Number(page)
    await service.flush(page);
    const fullpage = await service.getAllLines(pagenumber);
    if (fullpage.length > 0) {
      throw new Error("page not flushed");
    }
    logger.info(`flushed page: ${pagenumber}`);
    res.status(200).send({ status: "OK", fullpage, pagenumber });
  } catch (err: any) {
    logger.error(err.message);
    res.status(500).send({ status: "ERROR", error: err.message });
  }
};

const ping = async (req: Request, res: Response) => {
  logger.info(`pong`);
  res.status(200).send({ status: "OK", ping: "pong" });
};

const health = async (req: Request, res: Response) => {
  logger.info(`health`);
  res.status(200).send({ status: "OK" });
};
const close = async (req: Request, res: Response, service: Service) => {
  try {
    closeBook();
    res.send({ status: "OK" });
    serverManager.closeServer();
  } catch (err: any) {
    logger.error(err.message);
    res.statusCode = 500;
    res.send({ status: "ERROR", error: err.message });
  }
};

const Controller = {
  set,
  get,
  del,
  ping,
  getAll,
  flush,
  close,
  health,
};
export default Controller;
