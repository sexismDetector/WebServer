
import {controller, httpGet, interfaces, requestParam, response} from "inversify-express-utils";
import Controller = interfaces.Controller;
import PythonSpawnService from "../Services/PythonSpawnService";
import Component from "../Infrastructure/Component";
import {inject} from "inversify";
import {Response} from "express";

@controller("/classify")
export class ClassifierController implements Controller {

    private pythonService: PythonSpawnService;

    public constructor(
        @inject(Component.PythonSpawnService) pythonService: PythonSpawnService
    ) {
        this.pythonService = pythonService;
    }

    @httpGet("/:text") // TODO: Consider change to POST Request
    private async classify(
        @requestParam("text") text: string,
        @response() res: Response
    ): Promise<string> {
        const response: number = await this.pythonService.calculate([text, "Senate"]);
        return response.toString();
    }

}