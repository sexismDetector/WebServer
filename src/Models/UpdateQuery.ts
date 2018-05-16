
export default interface UpdateQuery {
    table: string,
    columns: string[],
    values: any[],
    where: string;
}