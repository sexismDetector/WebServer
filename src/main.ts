import container from "./Infrastructure/Installer";
import ITwitterCredentialsRepository from "./Interfaces/ITwitterCredentialsRepository";
import ObjectPool from "./Infrastructure/ObjectPool";


class Main {

    public static async main(): Promise<void> {
        const tCredentialsRepo = container.get<ITwitterCredentialsRepository>(ObjectPool.TwitterCredentialRepo);
        const credentials = await tCredentialsRepo.get();
        console.log(credentials);
    }

}

Main.main();
