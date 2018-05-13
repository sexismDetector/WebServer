
import PythonProcess from "../Models/PythonProcess";
import DeferredPromise from "../Models/DeferredPromise";
import {injectable} from "inversify";

@injectable()
export default class PythonSpawnService {

    private processes: PythonProcess[];
    private requestQueue: DeferredPromise<number, string[]>[];
    private handlerId: NodeJS.Timer;

    public constructor(filePath: string, args: string[], poolSize: number) {
        this.processes = [];
        this.requestQueue = [];
        for (let i = 0; i < poolSize; i++) {
            this.processes.push(new PythonProcess(filePath, args));
        }
        this.handlerId = setInterval(this.queueHandler, 50);
    }

    public calculate(args: string[]): Promise<number> {
        const promise = new DeferredPromise<number, string[]>();
        promise.Data = args;
        this.requestQueue.push(promise);
        return promise.promise;
    }

    private queueHandler: () => Promise<void> = async () => { // Preserve this binding inside loop
        if (this.requestQueue.length == 0) return;
        const promise = this.requestQueue.shift() as DeferredPromise<number, string[]>; // Dequeue
        for (let process of this.processes) {
            if (process.Available) {
                try {
                    const value = await process.calculate(promise.Data);
                    promise.resolve(value);
                } catch (err) {
                    promise.reject(err);
                }
            }
        }
    }

}