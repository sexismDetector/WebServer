import DeferredPromise from "./DeferredPromise";
import {ChildProcess, spawn} from "child_process"
import {Semaphore} from "await-semaphore"
import ConcurrencyError from "../Errors/ConcurrencyError";

type Unlocker = () => void;

export default class PythonProcess {

    private process: ChildProcess;
    private promise: DeferredPromise<number> | null;
    private semaphore: Semaphore;
    private unlock: Unlocker | null;

    public constructor(filePath: string, args: string[]) {
        this.semaphore = new Semaphore(1);
        this.promise = null;
        this.unlock = null;

        args.unshift(filePath); // Prepend filepath
        this.process = spawn("python3", args);
        this.process.on("data", this.processOutputListener);
    }

    public get Available(): boolean { // Check what count stands for
        return this.semaphore.count == 0;
    }

    public async calculate(args: string[]): Promise<number> {
        if (!this.Available) throw new ConcurrencyError("Process is unavailable");
        this.unlock = await this.semaphore.acquire();
        this.promise = new DeferredPromise<number>();
        for (let arg of args) {
            this.process.stdin.write(arg, "utf-8");
        }
        return this.promise.promise;
    }

    private processOutputListener(data: string): void {
        const result = Number(data);
        const promise = this.promise as DeferredPromise<number>;
        if (!isNaN(result)) {
            promise.resolve(result); // calculate returned promise resolves
        } else {
            promise.reject("Unexpected outcome from Python Process"); // same, but rejected
        }
        if (this.unlock != null) {
            this.unlock();
            this.clean();
        }
    }

    private clean(): void {
        this.unlock = null;
        this.promise = null;
    }

}