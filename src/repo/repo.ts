import { ILine, Book } from "../model/model";
import * as fs from "fs";
import { Mutex } from "async-mutex";
import logger from "../utils/logger";

export interface IPageRepo {
  get(): Promise<ILine[]>;
  updatePage(line: ILine[]): Promise<void>;
}

const filePath = "credit.db";
let book: Book = [];

try {
  const readByteArray = fs.readFileSync(filePath, "utf-8");
  book = JSON.parse(readByteArray.toString());
} catch (err: any) {
  if (err.code === "ENOENT") {
    const writeByteArray = Buffer.from(JSON.stringify(book));
    fs.writeFileSync(filePath, writeByteArray);
  } else {
    logger.error("Error reading file", filePath);
  }
}

export const closeBook = () => {
  try{
    const writeByteArray = Buffer.from(JSON.stringify(book));
    fs.writeFileSync(filePath, writeByteArray);
    logger.info("Book closed");
  }catch(err:any){
    logger.info(err.message);
    throw err;
  }
  
};

export class PageRepo implements IPageRepo {
  private id: number;
  private mutex: Mutex = new Mutex();

  constructor(id: number) {
    this.id = id;
  }

  async get(): Promise<ILine[]> {
    const release = await this.mutex.acquire();
    try {
      const currentPage = book[this.id];
      return currentPage ? currentPage.Line : [];
    } catch (err) {
      throw err;
    } finally {
      release();
    }
  }

  async updatePage(line: ILine[]): Promise<void> {
    const release = await this.mutex.acquire();
    try {
      book[this.id] = book[this.id] || { Line: [] };
      book[this.id].Line = line;
    } catch (err) {
      throw err;
    } finally {
      release();
    }
  }
}
