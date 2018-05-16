
import {Pool, PoolClient} from "pg";
import AbstractQuery from "./AbstractQuery";

export default class InsertBuilder extends AbstractQuery<void> {

    private table: string;
    private columnList: string[];
    private rawValues: any[];

    public constructor(client: PoolClient | null) {
        super(client);
        this.table = "";
        this.rawValues = [];
        this.columnList = [];
    }

    public into(table: string): InsertBuilder {
        this.table = this.doubleQuotationMarks(table);
        this.query = this.query.replace("@(x)", this.table);
        return this;
    }

    public columns(columns: string[]): InsertBuilder {
        this.columnList = columns;
        const columnString = this.parenthesisBuilder(columns);
        this.query = this.query.replace("@(y)", columnString);
        return this;
    }

    public values(values: any[]): InsertBuilder {
        values.forEach(val => {
           if (Array.isArray(val)) return val.join(",");
           return val;
        });
        this.rawValues = values;
        const valueString = this.parameterBuilder(this.rawValues);
        this.query = this.query.replace("@(z)", valueString);
        return this;
    }

    protected async executeQuery(client: PoolClient): Promise<void> {
        this.query = this.query.replace(new RegExp("\'", "g"), "''");
        await client.query(this.query, this.rawValues);
    }

    protected getRawQuery(): string {
        return "Insert Into @(x) @(y) Values @(z);";
    }

}