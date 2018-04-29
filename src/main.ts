
import {Container} from "inversify";
import container from "./Infrastructure/Installer";
import ITweetCrawlService from "./Interfaces/ITweetCrawlService";
import CSVLoaderService from "./Services/CSVLoaderService";
import Component from "./Infrastructure/Component";
import JSONLoaderService from "./Services/JSONLoaderService";

class Main {

    private static tweetCrawler: ITweetCrawlService;

    private static container: Container;

    public static async main(): Promise<void> {
        Main.container = await container;
        //Main.json();
    }

    public static async json() {
        const jsonService = Main.container.get<JSONLoaderService>(Component.JSONLoaderService);
        jsonService.loadJSONKeys(__dirname + "/../res/words_dictionary.json");
    }

    public static async csv() {
        const csvService = Main.container.get<CSVLoaderService>(Component.CSVLoaderService);
        csvService.loadCSV(__dirname + "/../res/hateSpeechTwitter.csv", tokens => {
            let rawId: string | null = tokens[1];
            if (rawId.indexOf("+") != -1) rawId = null;
            return {
                text: tokens[2],
                label: tokens[0] == "1" ? "sexist" : "none",
                id: rawId
            }
        });
    }

}


Main.main()
    .catch(err => {
        console.error(err);
        process.exit(-1);
    });
