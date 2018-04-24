import Tweet from "../Models/Tweet";
import TwitterUser from "../Models/TwitterUser";

export default interface ITwitterDataService {
    getTweet(id: string): Promise<Tweet>;
    getFollowers(userId: string): Promise<TwitterUser[]>
}