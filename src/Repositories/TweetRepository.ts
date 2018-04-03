import ITweetRepository from "../Interfaces/ITweetRepository";
import Tweet from "../Models/Tweet";
import {inject, injectable} from "inversify";
import IDatabaseDriver from "../Interfaces/IDatabaseDriver";
import ObjectPool from "../Infrastructure/ObjectPool";

@injectable()
export default class TweetRepository implements ITweetRepository {

    private database: IDatabaseDriver;

    public constructor(@inject(ObjectPool.Database) database: IDatabaseDriver) {
        this.database = database;
    }

    public async create(tweet: Tweet): Promise<void> {
        await this.database.write({
            into: "Tweets",
            columns: Object.keys(tweet),
            values: Object.values(tweet)
        });
    }

    public async get(id: string): Promise<Tweet> {
        const result: any[] = await this.database.read({
            select: ["*"],
            from: "Tweets",
            where: `id = '${id}'`
        });
        return result[0];
    }

    public async getAll(): Promise<Tweet[]> {
        const result: any[] = await this.database.read({
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