import * as Nightmare from "nightmare";
import {inject, injectable} from "inversify";
import * as $ from "jquery";
import Component from "../Infrastructure/Component";
import ITweetRepository from "../Interfaces/ITweetRepository";
import ITwitterDataService from "../Interfaces/ITwitterDataService";
import ITweetAuthorCrawlService from "../Interfaces/ITweetAuthorCrawlService";
import * as Filesystem from "fs-extra";

@injectable()
export default class TwitterAuthorCrawlService implements ITweetAuthorCrawlService {

    private readonly browser: Nightmare;
    private readonly twitterUrl = "https://twitter.com/search?q=";
    private readonly tweetRepo: ITweetRepository;
    private readonly twitterData: ITwitterDataService;
    private readonly notFoundLog: string[];

    public constructor(
        @inject(Component.TweetRepository) tweetRepo: ITweetRepository,
        @inject(Component.TwitterDataService) twitterData: ITwitterDataService
    ) {
        this.browser = new Nightmare({
            show: true,
            gotoTimeout: 1000
        });
        this.tweetRepo = tweetRepo;
        this.twitterData = twitterData;
        this.notFoundLog = [];
    }

    public async fixMissing(): Promise<void> {
        let i = 0;
        const tweets = await this.tweetRepo.getAllIf("user_id is null");
        console.log("Retrieved data!");
        for (let tweet of tweets) {
            const text = tweet.text;
            let url = this.twitterUrl;
            url += encodeURI(this.cleanString(text));
            const username = await this.crawlUsername(url);
            if (username == undefined || username == "") {
                this.notFoundLog.push(text);
            } else {
                const user = await this.twitterData.getUserByName(username);
                tweet.user_id = user.user_id;
                await this.tweetRepo.update(tweet);
                console.log(`User id fixed: ${++i}`);
            }
        }
        Filesystem.writeFileSync("../../res/notFoundLog.txt", this.notFoundLog.join("\n"));
    }

    private async crawlUsername(url: string): Promise<string | undefined> {
        let result: string = "";
        try {
             result = await this.browser
                .goto(url)
                .wait(".tweet")
                .wait(".username")
                .evaluate(() => {
                    const tweet = $(".tweet");
                    const user = tweet.find(".username");
                    if (user == undefined) return "";
                    return user.html();
                })
                .then((val: string) => val);
        } catch (err) {
            console.log("No tweet found");
        }

        result = result.replace("@", "");
        result = result.replace("<b>", "");
        result = result.replace("</b>", "");
        return result;
    }

    private cleanString(str: string) {
        return str.replace(/[^\x00-\x7F]/g, "");
    }

}