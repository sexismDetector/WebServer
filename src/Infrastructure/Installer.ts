import "reflect-metadata";
import {Container} from "inversify";
import ITwitterCredentialsRepository from "../Interfaces/ITwitterCredentialsRepository";
import SQLTwitterCredentialsRepository from "../Repositories/SQLTwitterCredentialsRepository";
import Component from "./Component";
import IDatabaseDriver from "../Interfaces/IDatabaseDriver";
import PostgreSQLDriver from "../Databases/PostgreSQLDriver";
import ITweetRepository from "../Interfaces/ITweetRepository";
import TweetRepository from "../Repositories/TweetRepository";
import ITwitterDataService from "../Interfaces/ITwitterDataService";
import TwitterDataService from "../Services/TwitterDataService";
import TwitterAuthentication from "../Authentication/TwitterAuthentication";
import TweetCrawlService from "../Services/TweetCrawlService";
import ITweetCrawlService from "../Interfaces/ITweetCrawlService";
import CSVLoaderService from "../Services/CSVLoaderService";
import JSONLoaderService from "../Services/JSONLoaderService";
import ILabeledWordRepository from "../Interfaces/ILabeledWordRepository";
import LabeledWordRepository from "../Repositories/LabeledWordRepository";
import ITwitterUserRepository from "../Interfaces/ITwitterUserRepository";
import TwitterUserRepository from "../Repositories/TwitterUserRepository";
import * as Filesystem from "fs-extra";

let container = new Container();

import "../Controllers/ClassifierController";
import PythonSpawnService from "../Services/PythonSpawnService";
import PythonModelFiles from "../Models/PythonModelFiles";
import ITweetAuthorCrawlService from "../Interfaces/ITweetAuthorCrawlService";
import TweetAuthorCrawlService from "../Services/TweetAuthorCrawlService";
import ITweetCleanService from "../Interfaces/ITweetCleanService";
import TweetCleanService from "../Services/TweetCleanService";

async function prepareContainer(container: Container): Promise<Container> {

    console.log("Preparing Components...");

    const filePath = `${__dirname}/../../config/models.json`;
    const pythonModels: PythonModelFiles = await Filesystem.readJson(filePath);


    container
        .bind<ITwitterCredentialsRepository>(Component.TwitterCredentialRepo)
        .to(SQLTwitterCredentialsRepository);

    container
        .bind<IDatabaseDriver>(Component.Database)
        .to(PostgreSQLDriver);

    container
        .bind<ITweetRepository>(Component.TweetRepository)
        .to(TweetRepository);

    container
        .bind<ITwitterUserRepository>(Component.TwitterUserRepository)
        .to(TwitterUserRepository);

    container
        .bind<ILabeledWordRepository>(Component.LabeledWordRepository)
        .to(LabeledWordRepository);

    container
        .bind<ITwitterDataService>(Component.TwitterDataService)
        .to(TwitterDataService);

    const twitterCredentials = await container.get<ITwitterCredentialsRepository>(Component.TwitterCredentialRepo).get();
    const twitterAuth = new TwitterAuthentication(
        twitterCredentials.key,
        twitterCredentials.secret
    );
    //console.log(await twitterAuth.getToken());

    container
        .bind<TwitterAuthentication>(Component.TwitterAuth)
        .toConstantValue(twitterAuth);

    container
        .bind<ITweetCrawlService>(Component.TweetCrawlerService)
        .to(TweetCrawlService);

    container
        .bind<ITweetAuthorCrawlService>(Component.TweetAuthorCrawlService)
        .to(TweetAuthorCrawlService);

    container
        .bind<CSVLoaderService>(Component.CSVLoaderService)
        .to(CSVLoaderService);

    container
        .bind<JSONLoaderService>(Component.JSONLoaderService)
        .to(JSONLoaderService);

    container
        .bind<ITweetCleanService>(Component.TweetCleanService)
        .to(TweetCleanService);

    container
        .bind<PythonSpawnService>(Component.PythonSpawnService)
        .toConstantValue(
            new PythonSpawnService(
                `${__dirname}/../../` + pythonModels.nn,
                [],
                pythonModels.poolSize
            )
        )
        .whenTargetNamed("NN");

    container
        .bind<PythonSpawnService>(Component.PythonSpawnService)
        .toConstantValue(
            new PythonSpawnService(
                `${__dirname}/../../` + pythonModels.svm,
                [],
                pythonModels.poolSize
            )
        )
        .whenTargetNamed("SVM");

    container
        .bind<PythonSpawnService>(Component.PythonSpawnService)
        .toConstantValue(
            new PythonSpawnService(
                `${__dirname}/../../` + pythonModels.ensemble,
                [],
                pythonModels.poolSize
            )
        )
        .whenTargetNamed("Ensemble");


    console.log("Components Prepared!");

    return container;
}

export default prepareContainer(container);
