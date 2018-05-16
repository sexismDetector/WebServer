import AbstractQuery from "./AbstractQuery";
import NotImplementedError from "../Errors/NotImplementedError";
import {Pool, PoolClient, PoolConfig} from "pg";
import SelectBuilder from "./SelectBuilder";

export default class UpdateBuilder extends AbstractQuery<void> {

    private table: string;
    private columns: string[];
    private values: string[];
    private condition: string;

    public constructor(client: PoolClient) {
        super(client);
        this.table = "";
        this.condition = "";
        this.columns = [];
        this.values = [];
    }

    public atTable(name: string): UpdateBuilder {
        this.table = this.doubleQuotationMarks(name);
        this.query = this.query.replace("@(x)", this.table);
        return this;
    }

    public setColumns(columns: string[]): UpdateBuilder {
        this.columns = columns;
        if (this.values.length != 0) this.set();
        return this;
    }

    public setValues(values: string[]): UpdateBuilder {
        this.values = values;
        if (this.columns.length != 0) this.set();
        return this;
    }

    public where(condition: string): UpdateBuilder {
        this.condition = condition;
        this.query = this.query.replace("@(z)", this.condition);
        return this;
    }

    public async executeQuery(client: PoolClient): Promise<void> {
        await client.query(this.query);
    }

    protected getRawQuery(): string {
        return "Update @(x) Set @(y) Where @(z);";
    }

    private set(): void {
        let pairs: string = "";
        for (let i = 0; i < this.columns.length; i++) {
            const column = this.columns[i];
            const value = this.values[i];
            pairs += `${column} = '${value}'`;
            if (i < this.columns.length - 1) pairs += ", ";
        }
        this.query = this.query.replace("@(y)", pairs);
    }

}