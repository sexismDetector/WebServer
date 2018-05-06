
export default class ConflictError extends Error {

    public constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }

}
