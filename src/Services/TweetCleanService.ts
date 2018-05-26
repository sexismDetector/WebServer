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
            const update: Tweet = {
                text: tweet.text,
                urban_score: tweet.urban_score,
                oxford_score: tweet.oxford_score,
                tweet_length: tweet.tweet_length
            };
            await this.tweetRepo.update(update);
            console.log(`Updated ${++updates}`);
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