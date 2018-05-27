import ILabeledWordRepository from "../Interfaces/ILabeledWordRepository";
import LabeledWord from "../Models/LabeledWord";
import NotImplementedError from "../Errors/NotImplementedError";
import {inject, injectable} from "inversify";
import IDatabaseDriver from "../Interfaces/IDatabaseDriver";
import Component from "../Infrastructure/Component";
import NotFoundError from "../Errors/NotFoundError";

@injectable()
export default class LabeledWordRepository implements ILabeledWordRepository {

    private database: IDatabaseDriver;

    public constructor(
        @inject(Component.Database) database: IDatabaseDriver
    ) {
        this.database = database;
    }

    public async create(word: LabeledWord): Promise<void> {
        await this.database.write({
            into: "LabeledWords",
            columns: Object.keys(word),
            values: Object.values(word)
        });
    }

    public get PoolSize(): number {
        return this.database.PoolSize;
    }

    public async get(word: string): Promise<LabeledWord> {
        let key = word;
        key = key.replace(new RegExp("\'", "g"), "''");
        const result = await this.database.read<LabeledWord>({
            select: ["*"],
            from: "LabeledWords",
            where: `word = '${key}'`
        });
        if (result.length == 0) throw new NotFoundError(word);
        return result[0];
    }

    public getAll(): Promise<LabeledWord[]> {
        throw new NotImplementedError();
    }

    public remove(id: string): Promise<void> {
        throw new NotImplementedError();
    }

}