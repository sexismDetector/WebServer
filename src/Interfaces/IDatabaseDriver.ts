import SelectQuery from "../Models/SelectQuery";
import InsertQuery from "../Models/InsertQuery";

export default interface IDatabaseDriver {
    read<T>(query: SelectQuery): Promise<T[]>;
    write(query: InsertQuery): Promise<void>;
    update(): Promise<void>;
    remove(): Promise<void>;
}