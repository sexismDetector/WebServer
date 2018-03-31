import fetch, {RequestInit, Response} from "node-fetch"
import TwitterAuthentication from "../Authentication/TwitterAuthentication";

export default class TwitterDataService {

    private static get BaseURL(): string {
        return "https://api.twitter.com/1.1/"
    }

    private auth: TwitterAuthentication;

    public constructor(auth: TwitterAuthentication) {
        this.auth = auth;
    }

    public async getTweet(id: string): Promise<any> {
        const options = this.getTweetOptions();
        let url: string = TwitterDataService.BaseURL;
        url += "statuses/show.json?id=" + id; //Change to URL build class
        const res: Response = await fetch(url, await options);
        if (res.status != 200) throw new Error("Id does not exist");
        return res.json();
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