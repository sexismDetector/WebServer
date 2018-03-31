import {Client} from "pg";

export default class SelectBuilder {

    private client: Client;

    private counter: number;
    private query: string;
    private columns: string[];
    private table: string;
    private condition: string;

    public constructor(client: Client) {
        this.client = client;
        this.counter = 1;
        this.query = SelectBuilder.RawSelect;
        this.columns = [];
        this.table = this.condition = "";
    }

    public select(columns: string[]): SelectBuilder {
        const columnString = this.parenthesisBuilder(this.columns = columns);
        this.query = this.query.replace("@(x)", columnString);
        return this;
    }

    public from(table: string): SelectBuilder {
        this.table = table;
        this.query = this.query.replace("@(y)", table);
        return this;
    }

    public where(condition: string): SelectBuilder {
        this.condition = condition;
        this.query = this.query.replace("@(z)", condition);
        return this;
    }

    public async execute(): Promise<any[]> {
        const array = this.columns;
            //.concat(this.table)
            //.concat(this.condition);
        return (await this.client.query(this.query)).rows;
    }

    private parenthesisBuilder(values: string[]): string {
        let columnString = "(";
        for (let i = 0; i < values.length; i++) {
            columnString += values[i];//this.NextParameter;
            if (i < values.length - 1) columnString += ", ";
        }
        columnString += ")";
        return columnString;
    }

    private get NextParameter(): string {
        return "$" + this.counter++;
    }

    private static get RawSelect(): string {
        return "Select @(x) From @(y) Where @(z);";
    }

}