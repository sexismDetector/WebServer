import SelectQuery from "../Models/SelectQuery";
import InsertQuery from "../Models/InsertQuery";

export default interface IDatabaseDriver {
    PoolSize: number;
    read<T>(query: SelectQuery): Promise<T[]>;
    write(query: InsertQuery): Promise<void>;
    update(query: any): Promise<void>;
    remove(): Promise<void>;
}