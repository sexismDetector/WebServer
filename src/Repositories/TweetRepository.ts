import ITweetRepository from "../Interfaces/ITweetRepository";
import Tweet from "../Models/Tweet";
import {inject, injectable} from "inversify";
import IDatabaseDriver from "../Interfaces/IDatabaseDriver";
import Component from "../Infrastructure/Component";
import NotImplementedError from "../Errors/NotImplementedError";
import {text} from "body-parser";

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

    public async getAllIf(condition: string) {
        const result = await this.database.read<Tweet>({
            select: ["*"],
            from: "Tweets",
            where: condition
        });
        return result;
    }

    public async getAllUserId(): Promise<string[]> {
        const result = await this.database.read<{user_id: string}>({
            select: ["user_id"],
            distinct: true,
            from: "Tweets",
            where: "user_id is not null"
        });
        return result.map(obj => obj.user_id);
    }

    public async update(tweet: Tweet): Promise<void> {
        let key = tweet.text;
        key = key.replace(new RegExp("\'", "g"), "''");
        for (let key of Object.keys(tweet)) {
            const value = (tweet as any)[key];
            if (value == "" || value == null) {
                delete (tweet as any)[key];
            }
        }
        delete tweet.text;
        await this.database.update({
            table: "Tweets",
            columns: Object.keys(tweet),
            values: Object.values(tweet),
            where: `text = '${key}'`
        });
    }

    public async remove(id: string): Promise<void> {
        throw new NotImplementedError();
    }

}