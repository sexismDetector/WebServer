import SelectBuilder from "../src/Databases/SelectBuilder";
import * as assert from "assert";
import "mocha";

describe("SelectBuilderTest", () => {

    let selectBuilder: SelectBuilder;

    beforeEach(() => {
       selectBuilder = new SelectBuilder(null);
    });

    it("Select All Data", () => {
        const query = `Select * From "Tweets" Where true;`;
        selectBuilder
            .select(["*"])
            .distinct(false)
            .from("Tweets")
            .where("true");
        const result = selectBuilder.QueryString;
        assert.equal(query, result);
    });

    it("Select Distinct Column", () => {
        const query = `Select distinct (id, screen_name) From "Tweets" Where id = '10';`;
        selectBuilder
            .select(["id", "screen_name"])
            .distinct(true)
            .from("Tweets")
            .where(`id = '10'`);
        const result = selectBuilder.QueryString;
        assert.equal(query, result);
    });

});