import { ILine, IMeta } from "model/model";
import { PageRepo, closeBook } from "../repo/repo";
import { find, map } from "lodash";


export default class Service {
  private page: number;

  constructor(pageNum: number) {
    this.page = pageNum;
  }

  async setPage(page: number): Promise<void> {
    this.page = page;
    return Promise.resolve();
  }

  async setLine(line: ILine): Promise<Omit<ILine, "Meta">> {
    line.Meta = {} as IMeta;
    const newPage = new PageRepo(this.page);

    const pageArray = await newPage.get();

    const existingLineIndex = pageArray.findIndex(
      (obj) => obj.key === line.key
    );

    if (existingLineIndex !== -1) {
      const updatedPageArray = pageArray.map((obj, index) => {
        if (index === existingLineIndex) {
          return { ...obj, ...line };
        }
        return obj;
      });

      await newPage.updatePage(updatedPageArray);
      closeBook();
      return {
        key: line.key,
        value: line.value,
      };
    } else {
      const updatedPageArray = [...pageArray, line];

      await newPage.updatePage(updatedPageArray);

      closeBook();
      return {
        key: line.key,
        value: line.value,
      };
    }
    
  }

  async getLine(key: string): Promise<Omit<ILine, "Meta">> {
    const newPage = new PageRepo(this.page);

    const pageArray = await newPage.get();

    const line = find(pageArray, { key: key });
    if (!line) {
      closeBook();
      return Promise.reject("Line not found");
    }
    closeBook();
    return { key: line.key, value: line.value };
  }

  async getAllLines(): Promise<Omit<ILine, "Meta">[]> {
    const newPage = new PageRepo(this.page);

    const pageArray = await newPage.get();

    closeBook();
    return map(pageArray, (line) => {
      return { key: line.key, value: line.value };
    });
  }

  async getPage(): Promise<number> {
    return Promise.resolve(this.page);
  }

  async flush(): Promise<void> {
    const newPage = new PageRepo(this.page);
    await newPage.updatePage([]);
    return Promise.resolve(closeBook())
  }
}
