import ITwitterCredentialsRepository from "../Interfaces/ITwitterCredentialsRepository";
import TwitterCredentials from "../Models/TwitterCredentials";
import {inject, injectable} from "inversify";
import IDatabaseDriver from "../Interfaces/IDatabaseDriver";
import Component from "../Infrastructure/Component";

@injectable()
export default class SQLTwitterCredentialsRepository implements ITwitterCredentialsRepository {

    private driver: IDatabaseDriver;

    public constructor(@inject(Component.Database) driver: IDatabaseDriver) {
        this.driver = driver;
    }

    public async get(): Promise<TwitterCredentials> {
        const result = await this.driver.read({
            select: ["key", "secret"],
            from: "TwitterCredentials",
            where: "true"
        });
        const rawRow = (result[0] as any)["row"];
        const values = rawRow.substring(1, rawRow.length - 1).split(",");
        return {
            id: 1,
            key: values[0],
            secret: values[1]
        };
    }

    public async update(): Promise<void> {

    }

}