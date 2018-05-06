
import {inject, injectable} from "inversify";
import * as Filesystem from "fs-extra";
import Component from "../Infrastructure/Component";
import ILabeledWordRepository from "../Interfaces/ILabeledWordRepository";

@injectable()
export default class JSONLoaderService {

    private wordRepo: ILabeledWordRepository;

    public constructor(
        @inject(Component.LabeledWordRepository) wordRepo: ILabeledWordRepository
    ) {
        this.wordRepo = wordRepo;
    }

    public async loadJSONKeys(filePath: string): Promise<void> {
        const json: any = await Filesystem.readJson(filePath);
        console.log(`Ready to load  + ${Object.keys(json).length} keys`);
        const keys: string[] = Object.keys(json);
        const poolSize = this.wordRepo.PoolSize;
        const batchSize = 0.9 * poolSize;
        for (let i = 0; i != -1; i++) {
            const promises: Promise<void>[] = [];
            for (let j = 0; j < batchSize; j++) {
                if (i * batchSize + j > keys.length) return;
                const key = keys[i*batchSize + j];
                if (this.isNullString(key)) continue;
                promises.push(this.wordRepo.create({
                    word: key,
                    urban_sexist: 0,
                    oxford_sexist: 0,
                    is_slang: 0,
                    oxford_sentimental: 0
                }));
            }
            await Promise.all(promises);
            console.log(`${poolSize * i} keys loaded`);
        }
    }

    private isNullString(value: string): boolean {
        return value == null || value == undefined || value == "";
    }

}