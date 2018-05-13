import {PoolClient} from "pg";
import AbstractQuery from "./AbstractQuery";

export default class SelectBuilder extends AbstractQuery<any[]> {

    private columns: string[];
    private table: string;
    private condition: string;

    public constructor(client: PoolClient) {
        super(client);
        this.columns = [];
        this.table = this.condition = "";
    }

    public select(columns: string[]): SelectBuilder {
        this.columns = columns;
        let columnString: string;
        if (this.selectAllColumns(this.columns)) columnString = "*";
        else columnString = this.parenthesisBuilder(this.columns);
        this.query = this.query.replace("@(x)", columnString);
        return this;
    }

    public from(table: string): SelectBuilder {
        this.table = this.doubleQuotationMarks(table);
        this.query = this.query.replace("@(y)", this.table);
        return this;
    }

    public where(condition: string): SelectBuilder {
        this.condition = condition;
        this.query = this.query.replace("@(z)", this.condition);
        return this;
    }

    public distinct(isDistinct: boolean): SelectBuilder {
        const replaceValue = isDistinct ? "distinct" : "";
        this.query = this.query.replace("@(d)", replaceValue);
        return this;
    }

    public async execute(): Promise<any[]> {
        const array = this.columns;
        //.concat(this.table)
        //.concat(this.condition);
        const result = await this.client.query(this.query);
        return result.rows;
    }

    protected getRawQuery(): string {
        return "Select @(d) @(x) From @(y) Where @(z);";
    }

    private selectAllColumns(columns: string[]): boolean {
        return columns.length == 1 && columns[0] == "*";
    }

}