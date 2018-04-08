import container from "./Infrastructure/Installer";
import Component from "./Infrastructure/Component";
import {Container} from "inversify";
import ITweetCrawlService from "./Interfaces/ITweetCrawlService";

class Main {

    private static tweetCrawler: ITweetCrawlService;

    private static container: Container;

    public static async main(): Promise<void> {
        Main.container = await container;
        this.tweetCrawler = Main.container.get<ITweetCrawlService>(Component.TweetCrawlerService);
        await this.tweetCrawler.getAll();
    }

}

Main.main();
