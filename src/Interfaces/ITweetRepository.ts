import Tweet from "../Models/Tweet";

export default interface ITweetRepository {
    PoolSize: number;
    get(id: string): Promise<Tweet>;
    getAll(): Promise<Tweet[]>;
    create(tweet: Tweet): Promise<void>;
    remove(id: string): Promise<void>;
}