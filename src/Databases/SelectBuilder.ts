import {Client, PoolClient} from "pg";
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
        this.columns = columns
        const columnString = this.parenthesisBuilder(columns);
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

    protected getRawQuery(): string {
        return "Select @(x) From @(y) Where @(z);";
    }

}