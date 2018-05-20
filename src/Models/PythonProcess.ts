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
        this.process.stdout.on("data", data => this.processOutputListener(data as Buffer));
        this.process.stderr.on("data", data => this.processErrorListener(data as Buffer));
    }

    public get Available(): boolean { // Check what count stands for
        return this.semaphore.count == 1;
    }

    public async calculate(args: string[]): Promise<number> {
        if (!this.Available) throw new ConcurrencyError("Process is unavailable");
        this.unlock = await this.semaphore.acquire();
        this.promise = new DeferredPromise<number>();
        for (let arg of args) {
            this.process.stdin.write(arg + "\n");
        }
        return this.promise.promise;
    }

    public processOutputListener: (data: Buffer) => void = data => {
        const result = Number(data.toString());
        const promise = this.promise as DeferredPromise<number>;
        if (!isNaN(result)) {
            promise.resolve(result); // calculate returned promise resolves
        } else {
            promise.reject("Unexpected outcome from Python Process: " + data.toString()); // same, but rejected
        }
        if (this.unlock != null) {
            this.unlock();
            this.clean();
        }
    };

    public processErrorListener: (err: Buffer) => void = err => {
        console.log(err.toString());
        //throw new Error(err.toString());
    };

    private clean(): void {
        this.unlock = null;
        this.promise = null;
    }

}