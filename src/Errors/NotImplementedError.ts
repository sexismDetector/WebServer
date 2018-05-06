
export default class NotImplementedError extends Error {
    public constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, NotImplementedError.prototype);
    }
}
