"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalServer = exports.getFreePort = void 0;
const axios_1 = __importDefault(require("axios"));
const net_1 = __importDefault(require("net"));
const child_process_1 = require("child_process");
const starknet_plugin_error_1 = require("../starknet-plugin-error");
const integrated_devnet_logger_1 = require("./integrated-devnet-logger");
function sleep(amountMillis) {
    return new Promise((resolve) => {
        setTimeout(resolve, amountMillis);
    });
}
function isFreePort(port) {
    return new Promise((accept, reject) => {
        const sock = net_1.default.createConnection(port);
        sock.once("connect", () => {
            sock.end();
            accept(false);
        });
        sock.once("error", (e) => {
            sock.destroy();
            if (e.code === "ECONNREFUSED") {
                accept(true);
            }
            else {
                reject(e);
            }
        });
    });
}
function getFreePort() {
    return __awaiter(this, void 0, void 0, function* () {
        const defaultDevnetPort = 5050; // starting here to avoid conflicts
        const step = 1000;
        const maxPort = 65535;
        for (let port = defaultDevnetPort + step; port <= maxPort; port += step) {
            if (yield isFreePort(port)) {
                return port.toString();
            }
        }
        throw new starknet_plugin_error_1.StarknetPluginError("Could not find a free port, try rerunning your command!");
    });
}
exports.getFreePort = getFreePort;
class ExternalServer {
    constructor(host, port, isAliveURL, processName, stdout, stderr) {
        this.host = host;
        this.port = port;
        this.isAliveURL = isAliveURL;
        this.processName = processName;
        this.stdout = stdout;
        this.stderr = stderr;
        this.connected = false;
        this.lastError = null;
        this._isDockerDesktop = null;
        ExternalServer.cleanupFns.push(this.cleanup.bind(this));
    }
    get isDockerDesktop() {
        if (this._isDockerDesktop === null) {
            this._isDockerDesktop = this.getIsDockerDesktop();
        }
        return this._isDockerDesktop;
    }
    /**
     * Check if docker is Docker Desktop
     */
    getIsDockerDesktop() {
        var _a;
        const res = (0, child_process_1.spawnSync)("docker", ["system", "info"], { encoding: "utf8" });
        //stdout is null when docker command doesn't exists
        return (_a = res.stdout) === null || _a === void 0 ? void 0 : _a.includes("Operating System: Docker Desktop");
    }
    get url() {
        return `http://${this.host}:${this.port}`;
    }
    static cleanAll() {
        this.cleanupFns.forEach((fn) => fn());
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.isServerAlive()) {
                const msg = `Cannot spawn ${this.processName}: ${this.url} already occupied.`;
                throw new starknet_plugin_error_1.StarknetPluginError(msg);
            }
            this.childProcess = yield this.spawnChildProcess();
            const logger = new integrated_devnet_logger_1.IntegratedDevnetLogger(this.stdout, this.stderr);
            this.childProcess.stdout.on("data", (chunk) => __awaiter(this, void 0, void 0, function* () {
                chunk = chunk.toString();
                yield logger.logHandler(this.stdout, chunk);
            }));
            // capture the most recent message from stderr
            this.childProcess.stderr.on("data", (chunk) => __awaiter(this, void 0, void 0, function* () {
                chunk = chunk.toString();
                yield logger.logHandler(this.stderr, chunk);
                this.lastError = chunk;
            }));
            return new Promise((resolve, reject) => {
                // called on successful start of the child process
                this.childProcess.on("spawn", () => __awaiter(this, void 0, void 0, function* () {
                    const startTime = new Date().getTime();
                    const maxWaitMillis = 60000;
                    const oneSleepMillis = 500;
                    // keep checking until process has failed/exited
                    while (this.childProcess) {
                        const elapsedMillis = new Date().getTime() - startTime;
                        if (elapsedMillis >= maxWaitMillis) {
                            const msg = `${this.processName} connection timed out!`;
                            reject(new starknet_plugin_error_1.StarknetPluginError(msg));
                            break;
                        }
                        else if (yield this.isServerAlive()) {
                            this.connected = true;
                            resolve();
                            break;
                        }
                        else {
                            yield sleep(oneSleepMillis);
                        }
                    }
                }));
                // this only happens if childProcess completely fails to start
                this.childProcess.on("error", (error) => {
                    this.childProcess = null;
                    reject(error);
                });
                // handle unexpected close of process
                this.childProcess.on("close", (code) => {
                    const isAbnormalExit = this.childProcess != null;
                    this.childProcess = null;
                    if (code !== 0 && isAbnormalExit) {
                        const circumstance = this.connected ? "running" : "connecting";
                        const moreInfo = logger.isFile(this.stderr)
                            ? "More error info in " + this.stderr
                            : "";
                        const msg = `${this.processName} exited with code=${code} while ${circumstance}. ${this.lastError}\n${moreInfo}`;
                        throw new starknet_plugin_error_1.StarknetPluginError(msg);
                    }
                });
            });
        });
    }
    stop() {
        if (!this.childProcess) {
            return;
        }
        this.cleanup();
        this.childProcess = null;
    }
    isServerAlive() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.port === null)
                return false;
            try {
                yield axios_1.default.get(`${this.url}/${this.isAliveURL}`);
                return true;
            }
            catch (err) {
                // cannot connect, so address is not occupied
                return false;
            }
        });
    }
    post(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureStarted();
            const hre = yield Promise.resolve().then(() => __importStar(require("hardhat")));
            try {
                const response = yield axios_1.default.post(this.url, data, {
                    timeout: hre.config.starknet.requestTimeout
                });
                return response.data;
            }
            catch (error) {
                const parent = error instanceof Error && error;
                const msg = `Error in interaction with Starknet CLI proxy server\n${error}`;
                throw new starknet_plugin_error_1.StarknetPluginError(msg, parent);
            }
        });
    }
    ensureStarted() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connected) {
                return;
            }
            yield this.start();
        });
    }
}
ExternalServer.cleanupFns = [];
exports.ExternalServer = ExternalServer;
//# sourceMappingURL=external-server.js.map