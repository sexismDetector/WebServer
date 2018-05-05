
export default interface ITweetCrawlService {
    getAll(): Promise<void>;
    storeUsers(): Promise<void>;
}