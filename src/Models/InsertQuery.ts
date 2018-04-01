
export default interface InsertQuery {
    into: string,
    columns: string[],
    values: any[]
}