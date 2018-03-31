import SelectQuery from "../Models/SelectQuery";

export default interface IDatabaseDriver {
    read<T>(query: SelectQuery): Promise<T[]>;
    write(): Promise<void>;
    update(): Promise<void>;
    remove(): Promise<void>;
}