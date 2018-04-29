import LabeledWord from "../Models/LabeledWord";

export default interface ILabeledWordRepository {
    PoolSize: number;
    get(id: string): Promise<LabeledWord>;
    getAll(): Promise<LabeledWord[]>;
    create(word: LabeledWord): Promise<void>;
    remove(id: string): Promise<void>;
}