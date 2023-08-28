import { ILine, IMeta } from "model/model";
import { PageRepo, closeBook } from "../repo/repo";
import { find, map } from "lodash";

export default class Service {
  private async performOperationAndUpdateBook<T>(
    newPage: PageRepo,
    operation: () => Promise<T>
  ): Promise<T> {
    try {
      const res = await operation();
      closeBook();
      return res;
    } catch (err) {
      closeBook();
      throw err;
    }
  }


  async setLine( page: number, line: ILine): Promise<Omit<ILine, "Meta">> {
    line.Meta = {} as IMeta;
    const newPage = new PageRepo(page);

    return this.performOperationAndUpdateBook(newPage, async () => {
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
        return {
          key: line.key,
          value: line.value,
        };
      } else {
        const updatedPageArray = [...pageArray, line];

        await newPage.updatePage(updatedPageArray);

        return {
          key: line.key,
          value: line.value,
        };
      }
    });
  }

  async getLine(page:number, key: string): Promise<Omit<ILine, "Meta">> {
    const newPage = new PageRepo(page);
    const pageArray = await newPage.get();
    return this.performOperationAndUpdateBook(newPage, async () => {
      const line = find(pageArray, { key: key });
      if (!line) {
        return Promise.reject(new Error("Line not found"));
      }
      return { key: line.key, value: line.value };
    });
  }

  async deleteLine(page:number, key: string): Promise<void> {
    const newPage = new PageRepo(page);
    try {
      const pageArray = await newPage.get();

      const line = find(pageArray, { key: key });
      if (!line) {
        throw new Error("Line not found");
      }
      const updatedPageArray = pageArray.filter((obj) => obj.key !== key);

      await newPage.updatePage(updatedPageArray);
    } catch (err) {
      throw err;
    } finally {
      closeBook();
    }
  }

  async getAllLines(page:number): Promise<Omit<ILine, "Meta">[]> {
    const newPage = new PageRepo(page);
    try {
      const pageArray = await newPage.get();
      return map(pageArray, (line) => {
        return { key: line.key, value: line.value };
      });
    } catch (err) {
      throw err;
    } finally {
      closeBook();
    }
  }


  async flush(page: number): Promise<void> {
    const newPage = new PageRepo(page);
    try {
      await newPage.updatePage([]);
    } catch (err) {
      throw err;
    } finally {
      closeBook();
    }
  }
}
