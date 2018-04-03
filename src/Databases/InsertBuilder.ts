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
        this.rawValues = values.map(this.quotationMarks);
        const valueString = this.parenthesisBuilder(this.rawValues);
        this.query = this.query.replace("@(z)", valueString);
        return this;
    }

    public async execute(): Promise<void> {
        await this.client.query(this.query);
    }

    protected getRawQuery(): string {
        return "Insert Into @(x) @(y) Values @(z);";
    }

}