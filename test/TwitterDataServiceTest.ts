import * as assert from "assert";
import * as FileSystem from "fs-extra"
import TwitterDataService from "../src/Services/TwitterDataService";
import TwitterAuth from "../src/Auth/TwitterAuth";


describe("TwitterDataServiceTest", () => {

    it("Get Tweet by ID", async () => {
        const json = await FileSystem.readJson(__dirname + "/test.ignore.json");
        const twitterData = new TwitterDataService(new TwitterAuth(json["key"], json["secret"]));
        const promise = twitterData.getTweet(json["tweetId"]);
        const data = await promise;
        assert.notEqual(data, null);
        return promise; // Rejected promises make Mocha's tests fail
    });

});