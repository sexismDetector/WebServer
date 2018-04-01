import ITwitterRepository from "../Interfaces/ITwitterRepository";
import Tweet from "../Models/Tweet";
import {injectable} from "inversify";
import IDatabaseDriver from "../Interfaces/IDatabaseDriver";

@injectable()
export default class TweetRepository implements ITwitterRepository {

    private database: IDatabaseDriver;

    public constructor(database: IDatabaseDriver) {
        this.database = database;
    }

    public async create(tweet: Tweet): Promise<void> {
        throw new Error("Not implemented");
    }

    public async get(id: string): Promise<Tweet> {
        throw new Error("Not implemented");
    }

    public async getAll(): Promise<Tweet[]> {
        throw new Error("Not implemented");
    }

    public async remove(id: string): Promise<void> {
        throw new Error("Not implemented");
    }

}