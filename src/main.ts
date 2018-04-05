import container from "./Infrastructure/Installer";
import ITwitterCredentialsRepository from "./Interfaces/ITwitterCredentialsRepository";
import ObjectPool from "./Infrastructure/ObjectPool";
import * as FileSystem from "fs-extra";
import LabeledTweet from "./Models/LabeledTweet";
import ITweetRepository from "./Interfaces/ITweetRepository";
import TwitterCredentials from "./Models/TwitterCredentials";
import TwitterDataService from "./Services/TwitterDataService";
import TwitterAuthentication from "./Authentication/TwitterAuthentication";

class Main {

    public static async main(): Promise<void> {
        const labeledTweets = await Main.getLabeledTweets();
        const tweetRepo = container.get<ITweetRepository>(ObjectPool.TweetRepository);
        const credentials = await Main.getCredentials();
        const twitterAuth = new TwitterAuthentication(
            credentials.key,
            credentials.secret
        );
        await twitterAuth.getToken();
        console.log("Token done!");
        const tweetService = new TwitterDataService(twitterAuth);
        for (let i = 0; i < 700; i++) {
            const id: string = labeledTweets[i].id;
            try {
                const tweet = tweetService.getTweet(id);
                console.log(i);
                tweet.then(console.log);
            } catch (err) {
                console.error(err);
            }
        }
        console.log("Queries done!")
    }

    private static async getCredentials(): Promise<TwitterCredentials> {
        const tCredentialsRepo = container.get<ITwitterCredentialsRepository>(ObjectPool.TwitterCredentialRepo);
        return await tCredentialsRepo.get();
    }

    private static async getLabeledTweets(): Promise<LabeledTweet[]> {
        const dataset: Buffer = await FileSystem.readFile(__dirname + "/../res/twitterDataset.csv");
        const rows: string[] = dataset.toString().split("\n");
        const labeledTweets: LabeledTweet[] = [];
        for (let rawRow of rows) {
            const row: string[] = rawRow.split(",");
            if (row[1] == "racism") continue;
            labeledTweets.push({
                id: row[0],
                isSexist: row[1] == "sexism"
            });
        }
        return labeledTweets;
    }

}

Main.main();
