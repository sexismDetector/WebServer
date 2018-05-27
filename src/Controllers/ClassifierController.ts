
import {controller, httpPost, interfaces, requestBody, response} from "inversify-express-utils";
import Controller = interfaces.Controller;
import PythonSpawnService from "../Services/PythonSpawnService";
import Component from "../Infrastructure/Component";
import {inject, named} from "inversify";
import {Response} from "express";
import ClassifyRequestBody from "../Models/ClassifyRequestBody";
import PostComment from "../Models/PostComment";
import TwitterUser from "../Models/TwitterUser";
import ITwitterDataService from "../Interfaces/ITwitterDataService";
import ModelPerformance from "../Models/ModelPerformance";
import NotImplementedError from "../Errors/NotImplementedError";

@controller("/classify")
export class ClassifierController implements Controller {

    private neuralNetwork: PythonSpawnService;
    private supportVectorMachine: PythonSpawnService;
    private twitterService: ITwitterDataService;

    private neuralNetPerformance: ModelPerformance;
    private svmPerformance: ModelPerformance;

    private nnWeight!: number;
    private svmWeight!: number;

    public constructor(
        @inject(Component.PythonSpawnService) @named("NN") neuralNetwork: PythonSpawnService,
        @inject(Component.PythonSpawnService) @named("SVM") supportVectorMachine: PythonSpawnService,
        @inject(Component.TwitterDataService) twitterService: ITwitterDataService
    ) {
        this.neuralNetwork = neuralNetwork;
        this.supportVectorMachine = supportVectorMachine;
        this.twitterService = twitterService;
        //this.neuralNetPerformance = this.loadPerformance("");
        this.neuralNetPerformance = {
            accuracy: 0.80
        };
        //this.svmPerformance = this.loadPerformance("");
        this.svmPerformance = {
            accuracy: 0.66
        };
        this.calcWeights();
    }

    @httpPost("/")
    private async classify(
        @requestBody() body: ClassifyRequestBody,
        @response() res: Response
    ): Promise<string> {
        const args = await this.makeArgs(body);
        const nnResponsePromise = this.neuralNetwork.calculate(args);
        const svmResponsePromise = this.supportVectorMachine.calculate(args);
        const nnResult = this.nnWeight * (await nnResponsePromise);
        const svmResult = this.svmWeight * (await svmResponsePromise);
        const result = nnResult + svmResult;
        return result.toString();
    }

    private async makeArgs(body: ClassifyRequestBody): Promise<string[]> {
        const twitterUserPromise = this.twitterService.getUserByName(body.screen_name);
        const comment: PostComment = {
            text: body.text,
            hashtags: []
        };
        const twitterUser = await twitterUserPromise;
        const user: TwitterUser = {
            user_id: twitterUser.user_id,
            screen_name: body.screen_name,
            followers_count: twitterUser.followers_count,
            friends_count: twitterUser.friends_count,
            favorites_count: twitterUser.favorites_count
        };
        return [comment, user].map(obj => JSON.stringify(obj));
    }

    private loadPerformance(file: string): ModelPerformance {
        throw new NotImplementedError();
    }

    private calcWeights() {
        const sum = this.neuralNetPerformance.accuracy + this.svmPerformance.accuracy;
        this.nnWeight = this.neuralNetPerformance.accuracy / sum;
        this.svmWeight = this.svmPerformance.accuracy / sum;
    }

}