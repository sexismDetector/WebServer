import PostComment from "../Models/PostComment";
import TweetScore from "../Models/TweetScore";
import Tweet from "../Models/Tweet";

export default interface ITweetCleanService {
    calculateTweetScores(): Promise<void>;
    tweetScore(tweet: Tweet | PostComment): Promise<TweetScore>;
}