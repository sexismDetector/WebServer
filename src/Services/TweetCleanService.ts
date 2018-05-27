import {inject, injectable} from "inversify";
import ITweetRepository from "../Interfaces/ITweetRepository";
import Component from "../Infrastructure/Component";
import ITweetCleanService from "../Interfaces/ITweetCleanService";
import ILabeledWordRepository from "../Interfaces/ILabeledWordRepository";
import TweetScore from "../Models/TweetScore";
import Tweet from "../Models/Tweet";
import LabeledWord from "../Models/LabeledWord";
import * as Filesystem from "fs-extra";

@injectable()
export default class TweetCleanService implements ITweetCleanService {

    private tweetRepo: ITweetRepository;
    private labeledWordRepo: ILabeledWordRepository;

    public constructor(
        @inject(Component.TweetRepository) tweetRepo: ITweetRepository,
        @inject(Component.LabeledWordRepository) labeledWordRepo: ILabeledWordRepository
    ) {
        this.tweetRepo = tweetRepo;
        this.labeledWordRepo = labeledWordRepo;
    }

    public async calculateTweetScores(): Promise<void> {
        let updates = 0;
        const tweets = await this.tweetRepo.getAll();
        console.log("Ready to roll: " + tweets.length);
        for (let tweet of tweets) {
            const score = await this.tweetScore(tweet);
            const update: Tweet = {
                text: tweet.text,
                urban_score: score.urbanScore,
                oxford_score: score.oxfordScore,
                tweet_length: score.tweetLength
            };
            await this.tweetRepo.update(update);
            console.log(`Updated ${++updates}`);
        }
    }

    private async tweetScore(tweet: Tweet): Promise<TweetScore> {
        const tokens = tweet.text.split(" ");
        // const wordMap = await this.loadLabeledFromFile("");
        const score: TweetScore = {
            urbanScore: 0,
            oxfordScore: 0,
            tweetLength: 0
        };
        for (let token of tokens) {
            score.tweetLength++;
            token = token.toLowerCase();
            try {
                const labeledWord = await this.labeledWordRepo.get(token);
                // const labeledWord = wordMap.get(token); if (labeledWord === undefined) continue;
                score.urbanScore += labeledWord.urban_sexist;
                score.oxfordScore += labeledWord.oxford_sexist;
            } catch (err) { // Word does not exist in dictionary

            }
        }
        return score;
    }

    private async loadLabeledFromFile(filePath: string): Promise<Map<string, LabeledWord>> {
        const map = new Map<string, LabeledWord>();
        const file: string = await Filesystem.readFile(filePath, "utf-8");
        const lines = file.split("\n");
        for (let line of lines) {
            const items = line.split(",");
            const labeledWord: LabeledWord = {
                word: items[0],
                urban_sexist: parseInt(items[1]),
                oxford_sexist: parseInt(items[2].toString()),
                oxford_sentimental: parseInt(items[3].toString()),
                is_slang: parseInt(items[4])
            };
            map.set(labeledWord.word, labeledWord);
        }
        return map;
    }

}