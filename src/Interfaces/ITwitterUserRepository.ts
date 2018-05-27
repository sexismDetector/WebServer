
import TwitterUser from "../Models/TwitterUser";

export default interface ITwitterUserRepository {
    PoolSize: number;
    get(id: string): Promise<TwitterUser>;
    getAll(): Promise<TwitterUser[]>;
    getAllUserId(): Promise<string[]>;
    create(user: TwitterUser): Promise<void>;
    remove(id: string): Promise<void>;
}