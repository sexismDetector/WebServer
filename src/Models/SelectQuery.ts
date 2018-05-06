
export default interface SelectQuery {
    select: string[],
    distinct?: boolean
    from: string,
    where: string
}