import ITweetRepository from "../src/Interfaces/ITweetRepository";
import container from "../src/Infrastructure/Installer";
import ObjectPool from "../src/Infrastructure/ObjectPool";
import * as assert from "assert";
import "mocha";

describe("TweetRespositoryTest", () => {

    let repo: ITweetRepository;

    before(() => {
        repo = container.get<ITweetRepository>(ObjectPool.TweetRepository);
    });

    it("Create a Tweet", async () => {
        await repo.create({
            id: "102",
            text: "I see through the lies of the Jedi",
            hashtags: ["#ShitIsWorking"],
            source: "Testing",
            user_id: "1001",
            reply_status_id: "10001",
            user_mentions: []
        });
    });

    it("Read a Tweet by Id", async () => {
        const tweet = await repo.get("101");
        assert.equal(tweet.text, "I am the Senate");
        console.log(tweet);
    });

    it("Read all Tweets", async () => {
        const tweets = await repo.getAll();
        assert(tweets.length > 1);
        console.log(tweets);
    });

});