

export default interface QueryBuilder<T> {
    execute(): Promise<T>;
}