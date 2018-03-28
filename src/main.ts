import TwitterDataService from "./Services/TwitterDataService";
import TwitterAuth from "./Auth/TwitterAuth";


class Main {

    public static async main(): Promise<void> {
        const twitterData = new TwitterDataService(new TwitterAuth("", ""));
    }

}

Main.main();
