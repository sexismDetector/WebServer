import * as Express from "express";
import exceptionally from "../Errors/Exceptionally";

let controller: Express.Router = Express.Router();

controller.get("/:comment", (req, res) => exceptionally(res, async () => {
    const comment: string = req.params["comment"];
}));

export default controller;