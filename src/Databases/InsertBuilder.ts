import QueryBuilder from "./QueryBuilder";
import {PoolClient} from "pg";
import AbstractQuery from "./AbstractQuery";

export default class InsertBuilder extends AbstractQuery<void> {

    private table: string;
    private columnList: string[];
    private rawValues: any[];

    public constructor(client: PoolClient) {
        super(client);
        this.table = "";
        this.rawValues = [];
        this.columnList = [];
    }

    public into(table: string): InsertBuilder {
        this.table = table;
        this.query.replace("@(x)", table);
        return this;
    }

    public columns(columns: string[]): InsertBuilder {
        this.columnList = columns;
        const columnString = this.parenthesisBuilder(columns);
        this.query.replace("@(y)", columnString);
        return this;
    }

    public values(values: any[]): InsertBuilder {
        this.rawValues = values;
        const valueString = this.parenthesisBuilder(values);
        this.query.replace("@(z)", valueString);
        return this;
    }

    public async execute(): Promise<void> {
        await this.client.query(this.query);
    }

    protected getRawQuery(): string {
        return "Insert Into @(x) @(y) Values @(z);";
    }

}