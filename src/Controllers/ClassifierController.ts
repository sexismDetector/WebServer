
import {controller, httpPost, interfaces, requestBody, response} from "inversify-express-utils";
import Controller = interfaces.Controller;
import PythonSpawnService from "../Services/PythonSpawnService";
import Component from "../Infrastructure/Component";
import {inject} from "inversify";
import {Response} from "express";
import ClassifyRequestBody from "../Models/ClassifyRequestBody";
import PostComment from "../Models/PostComment";
import TwitterUser from "../Models/TwitterUser";
import ITwitterDataService from "../Interfaces/ITwitterDataService";

@controller("/classify")
export class ClassifierController implements Controller {

    private pythonService: PythonSpawnService;
    private twitterService: ITwitterDataService;

    public constructor(
        @inject(Component.PythonSpawnService) pythonService: PythonSpawnService,
        @inject(Component.TwitterDataService) twitterService: ITwitterDataService
    ) {
        this.pythonService = pythonService;
        this.twitterService = twitterService;
    }

    @httpPost("/")
    private async classify(
        @requestBody() body: ClassifyRequestBody,
        @response() res: Response
    ): Promise<string> {
        const args = await this.makeArgs(body);
        const response: number = await this.pythonService.calculate(args);
        return response.toString();
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
            favorites_count: twitterUser.favorites_count
        };
        return [comment, user].map(obj => JSON.stringify(obj))
    }

}