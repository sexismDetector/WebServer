import Tweet from "../Models/Tweet";

export default interface ITweetRepository {
    PoolSize: number;
    get(id: string): Promise<Tweet>;
    getAll(): Promise<Tweet[]>;
    getAllIf(condition: string): Promise<Tweet[]>;
    getAllUserId(): Promise<string[]>
    create(tweet: Tweet): Promise<void>;
    update(tweet: Tweet): Promise<void>;
    remove(id: string): Promise<void>;
}