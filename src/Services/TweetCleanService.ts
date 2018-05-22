import {inject, injectable} from "inversify";
import ITweetRepository from "../Interfaces/ITweetRepository";
import Component from "../Infrastructure/Component";
import ITweetCleanService from "../Interfaces/ITweetCleanService";
import ILabeledWordRepository from "../Interfaces/ILabeledWordRepository";
import TweetScore from "../Models/TweetScore";
import Tweet from "../Models/Tweet";

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
            tweet.urban_score = score.urbanScore;
            tweet.oxford_score = score.oxfordScore;
            tweet.tweet_length = score.tweetLength;
            console.log(`Updated ${++updates}`);
        }
        const batchSize = 0.9 * this.tweetRepo.PoolSize;
        for (let i = 0; i != -1; i++) {
            const promises: Promise<void>[] = [];
            for (let j = 0;  j < batchSize; j++) {
                const tweet = tweets[i * batchSize + j];
                promises.push(this.tweetRepo.update(tweet));
            }
            await Promise.all(promises);
            console.log(`Batch # ${batchSize * i} updated`);
        }
    }

    private async tweetScore(tweet: Tweet): Promise<TweetScore> {
        const tokens = tweet.text.split(" ");
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
                score.urbanScore += labeledWord.urban_sexist;
                score.oxfordScore += labeledWord.oxford_sexist;
            } catch (err) { // Word does not exist in dictionary

            }
        }
        return score;
    }

}