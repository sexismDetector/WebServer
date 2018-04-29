import IDatabaseDriver from "../Interfaces/IDatabaseDriver";
import SelectQuery from "../Models/SelectQuery";
import {Pool, PoolClient, PoolConfig} from "pg";
import * as FileSystem from "fs-extra";
import SelectBuilder from "./SelectBuilder";
import {injectable} from "inversify";
import InsertQuery from "../Models/InsertQuery";
import InsertBuilder from "./InsertBuilder";
import {Semaphore} from "await-semaphore";

@injectable()
export default class PostgreSQLDriver implements IDatabaseDriver {

    private pool: Pool; // Use Pool to increase number of connection
    private poolSize: number;
    private semaphore: Semaphore;
    private counter = 0;

    public constructor() {
        const config: PoolConfig = FileSystem.readJSONSync(__dirname + "/../../config/config.json");
        this.pool = new Pool(config);
        this.poolSize = config.max as number;
        this.semaphore = new Semaphore(1);
    }

    private async getClient(): Promise<PoolClient> {
        const release = await this.semaphore.acquire();
        const client = await this.pool.connect();
        release();
        console.log(`Client senate ${this.counter++}`);
        return client;
    }

    public get PoolSize(): number {
        return this.poolSize;
    }

    public async read<T>(query: SelectQuery): Promise<T[]> { // It is responsability of every func to connect and end
        const client: PoolClient = await this.getClient();
        const resultPromise: Promise<any[]> = new SelectBuilder(client)
            .select(query.select)
            .from(query.from)
            .where(query.where)
        .execute();
        const result = await resultPromise;
        client.release();
        return result;
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
        try {
            await result;
        } catch (err) {
            console.log("Shit!");
            console.log(err);
        }
        client.release();
    }

}