import * as Express from "express";
import exceptionally from "../Errors/Exceptionally";
import {controller, httpGet, interfaces, requestParam} from "inversify-express-utils";
import Controller = interfaces.Controller;
import PythonSpawnService from "../Services/PythonSpawnService";

@controller("/classify")
export class ClassifierController implements Controller {

    public constructor() {

    }

    @httpGet("/:text") // TODO: Consider change to POST Request
    private async classify(
        @requestParam("text") text: string
    ): Promise<boolean> {
        const model = new PythonSpawnService("somePath", [], 10);
        const response: number = await model.calculate([text]);
        return response == 1;
    }

}