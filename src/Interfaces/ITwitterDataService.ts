import Tweet from "../Models/Tweet";

export default interface ITwitterDataService {
    getTweet(id: string): Promise<Tweet>;
}