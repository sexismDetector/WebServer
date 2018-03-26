import fetch, {RequestInit, Response} from "node-fetch"
import * as QueryString from "querystring";
import TwitterAccessToken from "./TwitterAccessToken";

export default class TwitterAuth {

    private static get AuthURL(): string {
        return "https://api.twitter.com/oauth2/token/";
    }
    private clientKey: string;
    private clientSecret: string;

    public constructor(clientKey: string, clientSecret: string) {
        this.clientKey = QueryString.escape(clientKey);
        this.clientSecret = QueryString.escape(clientSecret);
    }

    public async getToken(): Promise<TwitterAccessToken> {
        const res: Response = await fetch(TwitterAuth.AuthURL, this.tokenOptions());
        if (res.status != 200) throw new Error("Authentication Error");
        return await res.json();
    }

    private tokenOptions(): RequestInit {
        const authorization = this.clientKey + ":" + this.clientSecret;
        const encodedAuthorization = Buffer.from(authorization).toString("base64");
        return {
            headers: {
                "Authorization": "Basic " + encodedAuthorization,
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            },
            method: "POST",
            body: "grant_type=client_credentials"
        };
    }

}