
export default class UnauthorizedError extends Error {
    public constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}
