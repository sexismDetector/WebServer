import "reflect-metadata";
import {Container} from "inversify";
import ITwitterCredentialsRepository from "../Interfaces/ITwitterCredentialsRepository";
import SQLTwitterCredentialsRepository from "../Repositories/SQLTwitterCredentialsRepository";
import ObjectPool from "./ObjectPool";
import IDatabaseDriver from "../Interfaces/IDatabaseDriver";
import PostgreSQLDriver from "../Databases/PostgreSQLDriver";
import ITweetRepository from "../Interfaces/ITweetRepository";
import TweetRepository from "../Repositories/TweetRepository";

let container = new Container();

container
    .bind<ITwitterCredentialsRepository>(ObjectPool.TwitterCredentialRepo)
    .to(SQLTwitterCredentialsRepository);

container
    .bind<IDatabaseDriver>(ObjectPool.Database)
    .to(PostgreSQLDriver);

container
    .bind<ITweetRepository>(ObjectPool.TweetRepository)
    .to(TweetRepository);

export default container;
