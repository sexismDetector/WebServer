import * as assert from "assert";
import * as FileSystem from "fs-extra";
import TwitterDataService from "../src/Services/TwitterDataService";
import TwitterAuthentication from "../src/Authentication/TwitterAuthentication";
import "mocha";


describe("TwitterDataServiceTest", () => {

    it("Get Tweet by ID", async () => {
        const json = await FileSystem.readJson(__dirname + "/test.ignore.json");
        const twitterData = new TwitterDataService(new TwitterAuthentication(json["key"], json["secret"]));
        const promise = twitterData.getTweet(json["tweetId"]);
        const data = await promise;
        assert.notEqual(data, null);
    });

});