import SelectQuery from "../Models/SelectQuery";
import InsertQuery from "../Models/InsertQuery";
import UpdateQuery from "../Models/UpdateQuery";

export default interface IDatabaseDriver {
    PoolSize: number;
    read<T>(query: SelectQuery): Promise<T[]>;
    write(query: InsertQuery): Promise<void>;
    update(query: UpdateQuery): Promise<void>;
    remove(): Promise<void>;
}