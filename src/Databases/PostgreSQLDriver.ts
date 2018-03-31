import IDatabaseDriver from "./IDatabaseDriver";
import SelectQuery from "./SelectQuery";
import {Client, ClientConfig} from "pg";
import * as FileSystem from "fs-extra";
import SelectBuilder from "./SelectBuilder";

export default class PostgreSQLDriver implements IDatabaseDriver {

    private static instance: PostgreSQLDriver;

    public static async getInstance(): Promise<PostgreSQLDriver> {
        if (this.instance == undefined) {
            this.instance = new PostgreSQLDriver();
            await this.instance.connect();
        }
        return this.instance;
    }

    private client: Client | null;


    private constructor() {
        this.client = null;
    }

    private async connect(): Promise<void> {
        const config: ClientConfig = await FileSystem.readJson(__dirname + "/../../config/config.json");
        this.client = new Client(config);
        await this.client.connect();
    }

    public async read<T>(query: SelectQuery): Promise<T[]> {
        const result: Promise<any[]> = new SelectBuilder(this.client as Client)
            .select(query.select)
            .from(query.from)
            .where(query.where)
        .execute();
        return await result;
    }

    public async remove(): Promise<void> {

    }

    public async update(): Promise<void> {

    }

    public async write(): Promise<void> {

    }


}