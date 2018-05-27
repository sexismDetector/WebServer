import LabeledWord from "../Models/LabeledWord";

export default interface ILabeledWordRepository {
    PoolSize: number;
    get(word: string): Promise<LabeledWord>;
    getAll(): Promise<LabeledWord[]>;
    create(word: LabeledWord): Promise<void>;
    remove(id: string): Promise<void>;
}