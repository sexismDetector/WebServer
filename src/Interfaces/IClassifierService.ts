
export default interface IClassifierService {
    isSexist(text: string): Promise<boolean>;
}