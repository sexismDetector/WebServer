import {controller, httpPost, interfaces, requestBody, response} from "inversify-express-utils";
import Controller = interfaces.Controller;
import PythonSpawnService from "../Services/PythonSpawnService";
import Component from "../Infrastructure/Component";
import {inject, named, tagged} from "inversify";
import {Response} from "express";
import ClassifyRequestBody from "../Models/ClassifyRequestBody";
import PostComment from "../Models/PostComment";
import TwitterUser from "../Models/TwitterUser";
import ITwitterDataService from "../Interfaces/ITwitterDataService";
import ModelPerformance from "../Models/ModelPerformance";
import NotImplementedError from "../Errors/NotImplementedError";
import ITweetCleanService from "../Interfaces/ITweetCleanService";
import TweetScore from "../Models/TweetScore";
import * as Filesystem from "fs-extra";
import SVMPredictor from "../Models/SVMPredictor";

@controller("/classify")
export class ClassifierController implements Controller {

    private neuralNetwork: PythonSpawnService;
    private supportVectorMachine: PythonSpawnService;
    private twitterService: ITwitterDataService;
    private cleanService: ITweetCleanService;
    private readonly maxValues: any;

    public constructor(
        @inject(Component.PythonSpawnService) @named("NN") neuralNetwork: PythonSpawnService,
        @inject(Component.PythonSpawnService) @named("SVM") supportVectorMachine: PythonSpawnService,
        @inject(Component.TweetCleanService) cleanService: ITweetCleanService,
        @inject(Component.TwitterDataService) twitterService: ITwitterDataService
    ) {
        this.neuralNetwork = neuralNetwork;
        this.supportVectorMachine = supportVectorMachine;
        this.cleanService = cleanService;
        this.twitterService = twitterService;
        this.maxValues = Filesystem.readJSONSync(__dirname + "/../../res/maxValues.json");
    }

    /**
     * Classifies a queried comment as sexist or not
     * @param {ClassifyRequestBody} body HTTP Request Body
     * @param {e.Response} res Express Response object
     * @return {Promise<string>} // (0 to 1) double as string
     */
    @httpPost("/")
    private async classify(
        @requestBody() body: ClassifyRequestBody,
        @response() res: Response
    ): Promise<string> {
        const args = await this.makeArgs(body);
        args.forEach(arg => console.log(arg));
        const nnResponsePromise = this.supportVectorMachine.calculate(args);
        const result = await nnResponsePromise;
        return result.toString();
    }

    /**
     * Helper method to parse request body
     * @param {ClassifyRequestBody} body HTTP Request body
     * @return {Promise<string[]>} Array of encoded json strings
     */
    private async makeArgs(body: ClassifyRequestBody): Promise<string[]> {
        const twitterUserPromise = this.twitterService.getUserByName(body.screen_name);
        const comment: PostComment = {
            text: body.text,
            hashtags: []
        };
        const scorePromise = this.cleanService.tweetScore(comment);
        const twitterUser = await twitterUserPromise;
        const user: TwitterUser = {
            user_id: twitterUser.user_id,
            screen_name: body.screen_name,
            followers_count: twitterUser.followers_count,
            friends_count: twitterUser.friends_count,
            favorites_count: twitterUser.favorites_count
        };
        const score = await scorePromise;
        (user as any)["urban_score"] = score.urbanScore;
        (user as any)["oxford_score"] = score.oxfordScore;
        (user as any)["sex_words_ratio"] = this.getSWRatio(score);
        for (let key of Object.keys(user)) {
            const obj = user as any;
            if (typeof(obj) !== "number") {
                (user as any)[key] = this.normalize(obj[key], this.maxValues[key]);
            }
        }
        console.log(user);
        // TODO: Normalize maybe?
        return [comment, user].map(obj => JSON.stringify(obj));
    }
    
    private loadPerformance(file: string): ModelPerformance {
        throw new NotImplementedError();
    }

    private getSWRatio(score: TweetScore): Number {
        return (score.urbanScore + score.oxfordScore) / (score.tweetLength);
    }

    private normalize(value: number, maxValue: number): number {
        return value / maxValue;
    }

}