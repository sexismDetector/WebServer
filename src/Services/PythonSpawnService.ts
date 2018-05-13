
import PythonProcess from "../Models/PythonProcess";

export default class PythonSpawnService { // TODO: Inversify this :)

    private processes: PythonProcess[];

    public constructor(filePath: string, args: string[], poolSize: number) {
        this.processes = [];
        for (let i = 0; i < poolSize; i++) {
            this.processes.push(new PythonProcess(filePath, args));
        }
    }

    public async calculate(args: string[]): Promise<number> {
        for (let process of this.processes) {
            if (process.Available) return await process.calculate(args);
        }
        return -1; // TODO: Queueing
    }

}