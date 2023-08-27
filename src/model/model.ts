
export class Page {
    id: number;
    Line: ILine[]; 
    constructor(id: number, Line: ILine[]){
        this.id = id;
        this.Line = Line;
    }
}

export interface ILine {
    key: string;
    value: string;
    Meta: IMeta;
}


export interface IMeta {
    id: string;
    date: number;
}
export type Book = Page[];