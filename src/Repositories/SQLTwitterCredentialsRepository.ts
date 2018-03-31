import ITwitterCredentialsRepository from "./ITwitterCredentialsRepository";
import TwitterCredentials from "../Models/TwitterCredentials";
import PostgreSQLDriver from "../Databases/PostgreSQLDriver";

export default class SQLTwitterCredentialsRepository implements ITwitterCredentialsRepository {

    public constructor() {

    }


    public async get(): Promise<TwitterCredentials> {
        const driver = await PostgreSQLDriver.getInstance();
        const result = await driver.read({
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