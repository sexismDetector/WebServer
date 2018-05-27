
import PythonProcess from "../Models/PythonProcess";
import DeferredPromise from "../Models/DeferredPromise";
import {injectable} from "inversify";

@injectable()
export default class PythonSpawnService {

    private processes: PythonProcess[]; // Convert to a proper queue
    private requestQueue: DeferredPromise<number, string[]>[];
    private handlerId: NodeJS.Timer;

    public constructor(filePath: string, args: string[], poolSize: number) {
        const fileName = filePath
            .split("/")
            .filter((val, i, arr) => i == arr.length - 1)
            .join("");
        this.processes = [];
        this.requestQueue = [];
        for (let i = 0; i < poolSize; i++) { // Create Process Pool
            this.processes.push(new PythonProcess(filePath, args));
            console.log(`Spawning Python process ${i+1}: ${fileName}`);
        }
        this.handlerId = setInterval(this.queueHandler, 50); // Start spinning
    }

    /**
     * Interface method. Passes a query in the form of a string[] to an available Python process using a     *
     * intermediate queue
     * @param {string[]} args Query to be resolved by PythonProcess
     * @return {Promise<number>} Promise object containing the future response of PythonProcess
     */
    public calculate(args: string[]): Promise<number> {
        const promise = new DeferredPromise<number, string[]>();
        promise.Data = args;
        this.requestQueue.push(promise);
        return promise.promise;
    }

    /**
     * Queue Handler Method. This method sextracts requests from the Queue and defers them to an available
     * Python process that can resolve them. Uses a linear scheduler method. When there are no available
     * Python processes, we wait for a process to become available indefinitely.
     * (Handle not important for demo purpose)
     * @return {Promise<void>}
     */
    private queueHandler: () => Promise<void> = async () => { // Preserve this binding inside loop
        if (this.requestQueue.length == 0) return;
        const promise = this.requestQueue.shift() as DeferredPromise<number, string[]>; // Dequeue
        for (let process of this.processes) {
            if (process.Available) {
                try {
                    const value = await process.calculate(promise.Data);
                    promise.resolve(value);
                } catch (err) {
                    console.log(err.message);
                    promise.reject(err);
                }
            }
        }
    }

}