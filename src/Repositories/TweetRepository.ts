import ITweetRepository from "../Interfaces/ITweetRepository";
import Tweet from "../Models/Tweet";
import {inject, injectable} from "inversify";
import IDatabaseDriver from "../Interfaces/IDatabaseDriver";
import Component from "../Infrastructure/Component";

@injectable()
export default class TweetRepository implements ITweetRepository {

    private database: IDatabaseDriver;

    public constructor(@inject(Component.Database) database: IDatabaseDriver) {
        this.database = database;
    }

    public get PoolSize(): number {
        return this.database.PoolSize;
    }

    public async create(tweet: Tweet): Promise<void> {
        await this.database.write({
            into: "Tweets",
            columns: Object.keys(tweet),
            values: Object.values(tweet)
        });
    }

    public async get(id: string): Promise<Tweet> {
        const result = await this.database.read<Tweet>({
            select: ["*"],
            from: "Tweets",
            where: `id = '${id}'`
        });
        return result[0];
    }

    public async getAll(): Promise<Tweet[]> {
        const result = await this.database.read<Tweet>({
            select: ["*"],
            from: "Tweets",
            where: "true"
        });
        return result;
    }

    public async remove(id: string): Promise<void> {
        throw new Error("Not implemented");
    }

}