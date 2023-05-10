/// <reference types="node" />
import { ChildProcess, CommonSpawnOptions } from "child_process";
import { StringMap } from "../types";
export declare function getFreePort(): Promise<string>;
export declare abstract class ExternalServer {
    protected host: string;
    protected port: string | null;
    private isAliveURL;
    protected processName: string;
    protected stdout?: string;
    protected stderr?: string;
    protected childProcess: ChildProcess;
    private connected;
    private lastError;
    private _isDockerDesktop;
    constructor(host: string, port: string | null, isAliveURL: string, processName: string, stdout?: string, stderr?: string);
    get isDockerDesktop(): boolean;
    /**
     * Check if docker is Docker Desktop
     */
    private getIsDockerDesktop;
    get url(): string;
    protected static cleanupFns: Array<() => void>;
    static cleanAll(): void;
    protected abstract spawnChildProcess(options?: CommonSpawnOptions): Promise<ChildProcess>;
    protected abstract cleanup(): void;
    start(): Promise<void>;
    stop(): void;
    private isServerAlive;
    post<T>(data: StringMap): Promise<T>;
    private ensureStarted;
}
