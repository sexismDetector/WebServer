
type ResolveFunction<T> = (value?: T) => void;
type RejectFunction = (reason?: any) => void;

export default class DeferredPromise<T> {

    private prom: Promise<T>
    private res: ResolveFunction<T> | null = null;
    private rej: RejectFunction | null = null;

    public constructor() {
        this.prom = new Promise<T>((res, rej) => {
            this.res = res;
            this.rej = rej;
        });
    }

    public get promise(): Promise<T> {
        return this.prom;
    }

    public get resolve(): ResolveFunction<T> {
        return this.res as ResolveFunction<T>;
    }

    public get reject(): RejectFunction {
        return this.rej as RejectFunction;
    }
}