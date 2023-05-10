import { BindsMap, ProcessResult } from "@nomiclabs/hardhat-docker";
import { Image } from "@nomiclabs/hardhat-docker";
export declare const exec: (args: string) => ProcessResult;
export declare class DockerCairo1Compiler {
    image: Image;
    sources: string[];
    compilerArgs: string[];
    constructor(image: Image, sources: string[], cairo1CompilerArgs?: string[]);
    protected getDockerArgs(): BindsMap;
    protected getContainerArgs(): string[];
    compileCairo1(): Promise<ProcessResult>;
}
