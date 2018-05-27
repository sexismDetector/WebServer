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

/**
 * Service that allows querying Twitter API for different requestable objects (Users, Tweets, Ids, etc)
 */
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

    /**
     * Searches for a Tweet object given the tweet's id
     * @param {string} id Tweet's id
     * @return {Promise<Tweet>} Tweet Object
     */
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

    /**
     * Searches for a user Id given its screen name
     * @param {string} screenName
     * @return {Promise<string>}
     */
    public async searchId(screenName: string): Promise<string> {
        const options = this.getTweetOptions();
        const url = this.searchTweetUrl(screenName);
        const res: Response = await fetch(url, await options);
        const rawResponse = await res.json();
        console.log(rawResponse);
        throw new NotImplementedError();
    }

    /**
     * Searches for a User object given its user id
     * @param {string} userId
     * @return {Promise<TwitterUser>} User object
     * @throws {NotFoundError} If the user is not found
     */
    public async getUser(userId: string): Promise<TwitterUser> {
        const options: Promise<RequestInit> = this.getTweetOptions();
        const url = this.getUserUrl(userId);
        const res: Response = await fetch(url, await options);
        if (!res.ok) throw new NotFoundError("Id does not exist:" + userId);
        const rawUser: any = await res.json();
        return this.formatUser(rawUser);
    }

    /**
     * Searches for a User object give its screen name
     * @param {string} screenName
     * @return {Promise<TwitterUser>}
     * @throws {NotFoundError} If the user is not found
     */
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

    /**
     * Builder method for convenient url building
     * @param {string} path
     * @param {string} queryParam
     * @param {string} encodedQuery
     * @return {string}
     */
    private createUri(path: string, queryParam: string, encodedQuery: string): string {
        const url = new URL(path, TwitterDataService.BaseURL);
        url.search = `${queryParam}=${encodedQuery}`;
        return url.toString();
    }

    /**
     * Extract useful properties from Twitter's API response
     * @param rawTweet Twitter's API's raw response
     * @return {Tweet} Built Tweet Object
     */
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
    /**
     * Extract useful properties from Twitter's API response
     * @param rawTweet Twitter's API's raw response
     * @return {Tweet} Built User Object
     */
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

    /**
     * Helper method. Encodes access credentials for request use
     * @return {Promise<RequestInit>}
     */
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