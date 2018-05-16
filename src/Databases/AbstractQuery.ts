import QueryBuilder from "./QueryBuilder";
import {PoolClient} from "pg";

export default abstract class AbstractQuery<T> implements QueryBuilder<T> {

    private client: PoolClient | null;
    protected query: string;
    private counter: number;

    public constructor(client: PoolClient | null) {
        this.client = client;
        this.query = this.getRawQuery();
        this.counter = 1;
    }

    public get QueryString(): string {
        return this.query;
    }

    protected get NextParameter(): string {
        return "$" + this.counter++;
    }

    /**
     * Returns a string version of the concatenated array surrounded by parenthesis
     * @param values The array to be converted
     */
    protected parenthesisBuilder(values: string[]): string {
        return this.parenthesisGenericBuilder(values, val => val);
    }

    protected parameterBuilder(values: string[]) {
        return this.parenthesisGenericBuilder(values, val => this.NextParameter);
    }

    protected quotationMarks(value: string): string {
        return `'${value}'`;
    }

    protected doubleQuotationMarks(value: string): string {
        return `"${value}"`;
    }

    public execute(): Promise<T> {
        if (this.client == null) throw new Error("Client not initialized");
        return this.executeQuery(this.client);
    }

    protected abstract executeQuery(client: PoolClient): Promise<T>;

    protected abstract getRawQuery(): string;

    private parenthesisGenericBuilder(values: string[], action: (val: string) => string) {
        let columnString = "(";
        for (let i = 0; i < values.length; i++) {
            columnString += action(values[i]);
            if (i < values.length - 1) columnString += ", ";
        }
        columnString += ")";
        return columnString;
    }
}

