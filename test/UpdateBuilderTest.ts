import "mocha";
import UpdateBuilder from "../src/Databases/UpdateBuilder";
import * as assert from "assert";

describe("UpdateBuilderTest", () => {

    let updateBuilder: UpdateBuilder;

    beforeEach(() => {
        updateBuilder = new UpdateBuilder(null);
    });

    it("Update one param", () => {
        const query = `Update "Tweets" Set screen_name = 'senate' Where id = 'doit';`;
        updateBuilder
            .atTable("Tweets")
            .setColumns(["screen_name"])
            .setValues(["senate"])
            .where(`id = 'doit'`);
        const result = updateBuilder.QueryString;
        assert.equal(query, result);
    });

    it("Update several param", () => {
        const query = `Update "Tweets" Set screen_name = 'puppet', label = 'nice' Where id = 'master';`;
        updateBuilder
            .atTable("Tweets")
            .setColumns(["screen_name", "label"])
            .setValues(["puppet", "nice"])
            .where(`id = 'master'`);
        const result = updateBuilder.QueryString;
        assert.equal(query, result);
    });

});