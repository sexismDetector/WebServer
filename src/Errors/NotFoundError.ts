
export default class NotFoundError extends Error {
    public constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
