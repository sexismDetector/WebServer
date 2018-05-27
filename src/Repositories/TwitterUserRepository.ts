import ITwitterUserRepository from "../Interfaces/ITwitterUserRepository";
import TwitterUser from "../Models/TwitterUser";
import NotImplementedError from "../Errors/NotImplementedError";
import {inject, injectable} from "inversify";
import Component from "../Infrastructure/Component";
import IDatabaseDriver from "../Interfaces/IDatabaseDriver";

@injectable()
export default class TwitterUserRepository implements ITwitterUserRepository {

    private database: IDatabaseDriver;

    public constructor(@inject(Component.Database) database: IDatabaseDriver) {
        this.database = database;
    }

    public get PoolSize(): number {
        return this.database.PoolSize;
    }

    public async create(user: TwitterUser): Promise<void> {
        await this.database.write({
            into: "Users",
            columns: Object.keys(user),
            values: Object.values(user)
        });
    }

    public async get(id: string): Promise<TwitterUser> {
        const result = await this.database.read<TwitterUser>({
            select: ["*"],
            from: "Users",
            where: `id = '${id}'`
        });
        return result[0];
    }

    public async getAll(): Promise<TwitterUser[]> {
        const result = await this.database.read<TwitterUser>({
            select: ["*"],
            from: "Users",
            where: "true"
        });
        return result;
    }

    public async getAllUserId(): Promise<string[]> {
        const result = await this.database.read<{user_id: string}>({
            select: ["user_id"],
            distinct: true,
            from: "Users",
            where: "true"
        });
        return result.map(obj => obj.user_id);
    }

    public remove(id: string): Promise<void> {
        throw new NotImplementedError();
    }

}