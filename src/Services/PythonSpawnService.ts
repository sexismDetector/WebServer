import {ChildProcess, spawn} from "child_process";

export default class PythonSpawnService {

    private filePath: string;
    private args: string[];

    public constructor(filePath: string) {
        this.filePath = filePath;
        this.args = [];
    }

    public set Args(args: string[]) {
        this.args = args;
    }

    public async run(): Promise<string> {
        this.args.unshift(this.filePath); // Prepend program path
        let process: ChildProcess;
        return new Promise<string>((resolve, reject) => {
            try {
                process = spawn("python3", this.args);
            } catch(err) {
                console.log(err);
                reject(err);
            }
            process.stdout.on("data", data => {
                resolve(data.toString());
            });
        });
    }

}