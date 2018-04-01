import fetch, {RequestInit, Response} from "node-fetch"
import TwitterAuthentication from "../Authentication/TwitterAuthentication";
import Tweet from "../Models/Tweet";

export default class TwitterDataService {

    private static get BaseURL(): string {
        return "https://api.twitter.com/1.1/"
    }

    private auth: TwitterAuthentication;

    public constructor(auth: TwitterAuthentication) {
        this.auth = auth;
    }

    public async getTweet(id: string): Promise<Tweet> {
        const options = this.getTweetOptions();
        let url: string = TwitterDataService.BaseURL;
        url += "statuses/show.json?id=" + id; //Change to URL build class
        const res: Response = await fetch(url, await options);
        if (res.status != 200) throw new Error("Id does not exist");
        const rawTweet: any = await res.json();
        return {
            id: rawTweet.id_str,
            hashtags: rawTweet.entities.hashtags,
            text: rawTweet.text,
            source: rawTweet.source,
            user_id: rawTweet.user.id_str,
            reply_status_id: rawTweet.in_reply_to_status_id_str,
            user_mentions: rawTweet.entities.user_mentions
        }
    }

    private async getTweetOptions(): Promise<RequestInit> {
        const token = this.auth.getToken();
        return {
            headers: {
                "Authorization": "Bearer " + (await token).access_token,
                "Content-Type": "application/json",
            },
            method: "GET",
        };
    }

}