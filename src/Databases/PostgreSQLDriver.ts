import IDatabaseDriver from "../Interfaces/IDatabaseDriver";
import SelectQuery from "../Models/SelectQuery";
import {ClientConfig, Pool, PoolClient} from "pg";
import * as FileSystem from "fs-extra";
import SelectBuilder from "./SelectBuilder";
import {injectable} from "inversify";
import InsertQuery from "../Models/InsertQuery";
import InsertBuilder from "./InsertBuilder";

@injectable()
export default class PostgreSQLDriver implements IDatabaseDriver {

    private client: Pool; // Use Pool to increase number of connection

    public constructor() {
        const config: ClientConfig = FileSystem.readJSONSync(__dirname + "/../../config/config.json");
        this.client = new Pool(config);
    }

    private async getClient(): Promise<PoolClient> {
        return await this.client.connect();
    }

    public async read<T>(query: SelectQuery): Promise<T[]> { // It is responsability of every func to connect and end
        const client: PoolClient = await this.getClient();
        const result: Promise<any[]> = new SelectBuilder(client)
            .select(query.select)
            .from(query.from)
            .where(query.where)
        .execute();
        client.release();
        return await result;
    }

    public async remove(): Promise<void> {

    }

    public async update(): Promise<void> {

    }

    public async write(query: InsertQuery): Promise<void> {
        const client: PoolClient = await this.getClient();
        const result: Promise<void> = new InsertBuilder(client)
            .into(query.into)
            .columns(query.columns)
            .values(query.values)
        .execute();
        client.release();
        await result;
    }

}