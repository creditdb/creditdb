import {Request, Response, NextFunction} from "express";
import logger from "../utils/logger";


const jsonParsingMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError) {
        logger.error("Invalid JSON payload");
      res.status(400).json({ error: "Invalid JSON payload" });
    } else {
      next();
    }
  };
  
  export default jsonParsingMiddleware;