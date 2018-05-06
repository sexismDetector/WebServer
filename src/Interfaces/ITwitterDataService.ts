import Tweet from "../Models/Tweet";
import TwitterUser from "../Models/TwitterUser";

export default interface ITwitterDataService {
    getTweet(id: string): Promise<Tweet>;
    searchId(text: string): Promise<string>;
    getUser(userId: string): Promise<TwitterUser>
}