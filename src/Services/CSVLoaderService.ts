import {inject, injectable} from "inversify";
import * as Filesystem from "fs-extra";
import ITweetRepository from "../Interfaces/ITweetRepository";
import Component from "../Infrastructure/Component";
import Tweet from "../Models/Tweet";

@injectable()
export default class CSVLoaderService {

    private tweetRepo: ITweetRepository;

    public constructor(
        @inject(Component.TweetRepository) tweetRepo: ITweetRepository
    ) {
        this.tweetRepo = tweetRepo;
    }

    /**
     * Loads a batch of tweets into database
     * @param {string} filePath CSV File path
     * @param {(row: string) => boolean} filter Filter function to parse CSV
     * @param {(tokens: string[]) => Tweet} parse Parse function to convert raw CSV line to Tweet object
     * @return {Promise<void>}
     */
    public async loadCSV(
        filePath: string,
        filter: (row: string) => boolean,
        parse: (tokens: string[]) => Tweet
    ): Promise<void> {
        const rawFile: string = await Filesystem.readFile(filePath, "utf-8");
        let file: string[] = rawFile.split("\n");
        file = this.filterCSV(file, filter);
        console.log(`Ready to load ${file.length} records`);
        const poolSize = this.tweetRepo.PoolSize;
        const batchSize = 0.9 * poolSize;
        for (let i = 0; i != -1; i++) { // Upload batchSize records each time
            const promises: Promise<void>[] = [];
            for (let j = 0; j < batchSize; j++) {
                if (i * batchSize + j >= file.length) return;
                let tokens: string[] = file[i * batchSize + j].split(",");
                const tweet = parse(tokens);
                promises.push(this.tweetRepo.create(tweet));
            }
            await Promise.all(promises);
            console.log(`Batch # ${batchSize * i} uploaded`);
        }
    }

    /**
     * Helper function to iterate and filter CSV
     * @param {string[]} rows
     * @param {(row: string) => boolean} filter
     * @return {string[]}
     */
    private filterCSV(rows: string[], filter: (row: string) => boolean): string[] {
        const filtered: string[] = [];
        for (let row of rows) {
            if (filter(row)) filtered.push(row);
        }
        return filtered;
    }
}