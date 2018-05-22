
export default interface ClassifyRequestBody {
    text: string;
    screen_name: string;
    run_svm: boolean,
    run_nn: boolean,
    run_tfidf: boolean;
}