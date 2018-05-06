
import {Container} from "inversify";
import container from "./Infrastructure/Installer";
import ITweetCrawlService from "./Interfaces/ITweetCrawlService";
import CSVLoaderService from "./Services/CSVLoaderService";
import Component from "./Infrastructure/Component";
import JSONLoaderService from "./Services/JSONLoaderService";
import ITwitterDataService from "./Interfaces/ITwitterDataService";

class Main {

    private static tweetCrawler: ITweetCrawlService;

    private static container: Container;

    public static async main(): Promise<void> {
        Main.container = await container;
        const crawlService = Main.container.get<ITweetCrawlService>(Component.TweetCrawlerService);
        crawlService.storeUsers();
    }

    public static async json() {
        const jsonService = Main.container.get<JSONLoaderService>(Component.JSONLoaderService);
        jsonService.loadJSONKeys(__dirname + "/../res/words_dictionary.json");
    }

    public static async labeledCsv() {
        const csvService = Main.container.get<CSVLoaderService>(Component.CSVLoaderService);
        csvService.loadCSV(__dirname + "/../res/labeled_data.csv", row => {
            const columnCount = row.split(",").length;
            return columnCount == 7;
        },tokens => {
            return {
                text: tokens[6],
                label: tokens[5] != "2" ? "sexist" : "none"
            };
        });
    }

}


Main.main()
    .catch(err => {
        console.error(err);
        process.exit(-1);
    });
