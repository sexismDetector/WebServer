import TwitterCredentials from "../Models/TwitterCredentials";

export default interface ITwitterCredentialsRepository {
    get(): Promise<TwitterCredentials>;
    update(): Promise<void>;
}