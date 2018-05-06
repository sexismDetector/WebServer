import fetch, {RequestInit, Response} from "node-fetch"
import * as QueryString from "querystring";
import TwitterAccessToken from "../Models/TwitterAccessToken";

export default class TwitterAuthentication {

    private static get AuthURL(): string {
        return "https://api.twitter.com/oauth2/token/";
    }

    private clientKey: string;
    private clientSecret: string;

    private accessToken: TwitterAccessToken | null;

    public constructor(clientKey: string, clientSecret: string) {
        this.clientKey = QueryString.escape(clientKey);
        this.clientSecret = QueryString.escape(clientSecret);
        this.accessToken = null;
    }

    public async getToken(): Promise<TwitterAccessToken> {
        if (this.accessToken != null) return this.accessToken;
        const res: Response = await fetch(TwitterAuthentication.AuthURL, this.TokenOptions);
        if (res.status != 200) throw new Error("Authentication Error");
        return this.accessToken = await res.json();
    }

    private get TokenOptions(): RequestInit {
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