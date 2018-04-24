import fetch, {RequestInit, Response} from "node-fetch"
import TwitterAuthentication from "../Authentication/TwitterAuthentication";
import Tweet from "../Models/Tweet";
import ITwitterDataService from "../Interfaces/ITwitterDataService";
import {inject, injectable} from "inversify";
import Component from "../Infrastructure/Component";
import NotImplementedError from "../Errors/NotImplementedError";

@injectable()
export default class TwitterDataService implements ITwitterDataService {

    //private semaphore: Semaphore;

    private static get BaseURL(): string {
        return "https://api.twitter.com/1.1/"
    }

    private auth: TwitterAuthentication;

    public constructor(
        @inject(Component.TwitterAuth) auth: TwitterAuthentication
    ) {
        this.auth = auth;
        //this.semaphore = new Semaphore(50);
    }

    public async getTweet(id: string): Promise<Tweet> {
        const options = this.getTweetOptions();
        const url = this.getByIdUrl(id);
        //const release: () => void = await this.semaphore.acquire();
        const res: Response = await fetch(url, await options);
        //release();
        if (!res.ok) throw new Error(res.status.toString());
        const rawTweet: any = await res.json();
        return this.formatTweet(rawTweet);
    }

    public async getFollowers(userId: string): Promise<String[]> {
        throw new NotImplementedError();
    }

    private getByIdUrl(id: string): string {
        let url =  TwitterDataService.BaseURL;
        url += "statuses/show.json?id=" + id; //Change to URL build class
        return url;
    }

    private formatTweet(rawTweet: any): Tweet {
        return {
            id: rawTweet.id_str,
            hashtags: rawTweet.entities.hashtags,
            text: rawTweet.text,
            user_id: rawTweet.user.id_str,
            reply_status_id: rawTweet.in_reply_to_status_id_str,
            user_mentions: rawTweet.entities.user_mentions
        };
    }

    private async getTweetOptions(): Promise<RequestInit> {
        return {
            headers: {
                "Authorization": "Bearer " + (await this.auth.getToken()).access_token,
                "Content-Type": "application/json",
            },
            method: "GET",
        };
    }

}