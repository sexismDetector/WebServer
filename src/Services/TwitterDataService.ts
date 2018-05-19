import fetch, {RequestInit, Response} from "node-fetch"
import TwitterAuthentication from "../Authentication/TwitterAuthentication";
import Tweet from "../Models/Tweet";
import ITwitterDataService from "../Interfaces/ITwitterDataService";
import {inject, injectable} from "inversify";
import Component from "../Infrastructure/Component";
import NotImplementedError from "../Errors/NotImplementedError";
import {URL} from "url"
import TwitterUser from "../Models/TwitterUser";
import NotFoundError from "../Errors/NotFoundError";

@injectable()
export default class TwitterDataService implements ITwitterDataService {

    //private semaphore: Semaphore;

    private static get BaseURL(): string {
        return "https://api.twitter.com/1.1/";
    }

    private auth: TwitterAuthentication;

    public constructor(
        @inject(Component.TwitterAuth) auth: TwitterAuthentication
    ) {
        this.auth = auth;
        //this.semaphore = new Semaphore(50);
    }

    public async getTweet(id: string): Promise<Tweet> {
        const options: Promise<RequestInit> = this.getTweetOptions();
        const url = this.getByIdUrl(id);
        //const release: () => void = await this.semaphore.acquire();
        const res: Response = await fetch(url, await options);
        //release();
        if (!res.ok) throw new Error(res.status.toString());
        const rawTweet: any = await res.json();
        return this.formatTweet(rawTweet);
    }

    public async searchId(screenName: string): Promise<string> {
        const options = this.getTweetOptions();
        const url = this.searchTweetUrl(screenName);
        const res: Response = await fetch(url, await options);
        const rawResponse = await res.json();
        console.log(rawResponse);
        throw new NotImplementedError();
    }

    public async getUser(userId: string): Promise<TwitterUser> {
        const options: Promise<RequestInit> = this.getTweetOptions();
        const url = this.getUserUrl(userId);
        const res: Response = await fetch(url, await options);
        if (!res.ok) throw new NotFoundError("Id does not exist:" + userId);
        const rawUser: any = await res.json();
        return this.formatUser(rawUser);
    }

    public async getUserByName(screenName: string): Promise<TwitterUser> {
        const options = this.getTweetOptions();
        const url = this.getUserByNameUrl(screenName);
        const res: Response = await fetch(url, await options);
        if (!res.ok) throw new NotFoundError("Screen name does not exist:" + screenName);
        const rawUser: any = await res.json();
        return this.formatUser(rawUser);
    }

    private getByIdUrl(id: string): string {
        return this.createUri("statuses/show.json", "id", id);
    }

    private getUserUrl(id: string): string {
        return this.createUri("users/show.json", "id", id);
    }

    private getUserByNameUrl(screenName: string) {
        return this.createUri("users/show.json", "screen_name", screenName);
    }

    private searchTweetUrl(tweet: string) {
        return this.createUri("search/tweets.json", "q", encodeURI(tweet));
    }

    private createUri(path: string, queryParam: string, encodedQuery: string): string {
        const url = new URL(path, TwitterDataService.BaseURL);
        url.search = `${queryParam}=${encodedQuery}`;
        return url.toString();
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

    private formatUser(rawUser: any): TwitterUser {
        return {
            user_id: rawUser.id_str,
            screen_name: rawUser.screen_name,
            followers_count: rawUser.followers_count,
            friends_count: rawUser.friends_count,
            favorites_count: rawUser.favourites_count,
            statuses_count: rawUser.statuses_count
        }
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