import QueryBuilder from "./QueryBuilder";
import {PoolClient} from "pg";

export default abstract class AbstractQuery<T> implements QueryBuilder<T> {

    protected client: PoolClient;
    protected query: string;
    private counter: number;

    public constructor(client: PoolClient) {
        this.client = client;
        this.query = this.getRawQuery();
        this.counter = 1;
    }

    protected get NextParameter(): string {
        return "$" + this.counter++;
    }

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

    public abstract execute(): Promise<T>;

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

