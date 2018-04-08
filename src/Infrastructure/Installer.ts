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

let container = new Container();

async function prepareContainer(container: Container): Promise<Container> {
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
        .bind<ITwitterDataService>(Component.TwitterDataService)
        .to(TwitterDataService);

    const twitterCredentials = await container.get<ITwitterCredentialsRepository>(Component.TwitterCredentialRepo).get();
    const twitterAuth = new TwitterAuthentication(
        twitterCredentials.key,
        twitterCredentials.secret
    );
    await twitterAuth.getToken();

    container
        .bind<ITweetCrawlService>(Component.TweetCrawlerService)
        .to(TweetCrawlService);

    container.bind<TwitterAuthentication>(Component.TwitterAuth)
        .toConstantValue(twitterAuth);
    return container;
}

export default prepareContainer(container);
