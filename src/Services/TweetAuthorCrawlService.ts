import * as Nightmare from "nightmare";
import {inject, injectable} from "inversify";
import * as $ from "jquery";
import Component from "../Infrastructure/Component";
import ITweetRepository from "../Interfaces/ITweetRepository";
import ITwitterDataService from "../Interfaces/ITwitterDataService";
import ITweetAuthorCrawlService from "../Interfaces/ITweetAuthorCrawlService";

@injectable()
export default class TwitterAuthorCrawlService implements ITweetAuthorCrawlService {

    private readonly browser: Nightmare;
    private readonly twitterUrl = "https://twitter.com/search?q=";
    private readonly tweetRepo: ITweetRepository;
    private readonly twitterData: ITwitterDataService;

    public constructor(
        @inject(Component.TweetRepository) tweetRepo: ITweetRepository,
        @inject(Component.TwitterDataService) twitterData: ITwitterDataService
    ) {
        this.browser = new Nightmare({
            show: true
        });
        this.tweetRepo = tweetRepo;
        this.twitterData = twitterData;
    }

    public async fixMissing(): Promise<void> {
        const tweets = await this.tweetRepo.getAllIf("user_id is null");
        for (let tweet of tweets) {
            const text = tweet.text;
            let url = this.twitterUrl;
            url += encodeURI(this.cleanString(text));
            const username = await this.crawlUsername(url);
            tweet.user_id = await this.twitterData.searchId(username);
            this.tweetRepo.update(tweet);
        }
    }

    private async crawlUsername(url: string): Promise<string> {
        const result = await this.browser
            .goto(url)
            .wait(".tweet")
            .wait(".username")
            .evaluate(() => {
                const tweet = $(".tweet");
                const user = tweet.find(".username");
                return user.html();
            })
            .then((val: string) => val);
        return result;
    }

    private cleanString(str: string) {
        return str.replace(/[^\x00-\x7F]/g, "");
    }

}