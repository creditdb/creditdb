import { ILine, Book } from "../model/model";
import * as fs from "fs";
import { Mutex } from "async-mutex";

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
    console.log("Error reading file", filePath);
  }
}

export const closeBook = () => {
  const writeByteArray = Buffer.from(JSON.stringify(book));
  fs.writeFileSync(filePath, writeByteArray);
  console.log("Book closed");
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
      return Promise.resolve(currentPage ? currentPage.Line : []);
    } finally {
      release();
    }
  }

  async updatePage(line: ILine[]): Promise<void> {
    const release = await this.mutex.acquire();
    try {
      book[this.id] = book[this.id] || { Line: [] };
      book[this.id].Line = line;
    } finally {
      release();
    }
    return Promise.resolve();
  }
}
