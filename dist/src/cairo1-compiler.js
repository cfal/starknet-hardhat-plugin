"use strict";
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
exports.DockerCairo1Compiler = exports.exec = void 0;
const hardhat_docker_1 = require("@nomiclabs/hardhat-docker");
const shelljs_1 = __importDefault(require("shelljs"));
const exec = (args) => {
    const result = shelljs_1.default.exec(args, {
        silent: true
    });
    return {
        statusCode: result.code,
        stdout: Buffer.from(result.stderr),
        stderr: Buffer.from(result.stdout)
    };
};
exports.exec = exec;
class DockerCairo1Compiler {
    constructor(image, sources, cairo1CompilerArgs) {
        this.image = image;
        this.sources = sources;
        this.compilerArgs = cairo1CompilerArgs;
    }
    getDockerArgs() {
        const binds = {};
        for (const source of this.sources) {
            binds[source] = source;
        }
        return binds;
    }
    getContainerArgs() {
        return ["/bin/sh", "-c", this.compilerArgs.join(" ")];
    }
    compileCairo1() {
        return __awaiter(this, void 0, void 0, function* () {
            const docker = yield hardhat_docker_1.HardhatDocker.create();
            if (!(yield docker.hasPulledImage(this.image))) {
                yield docker.pullImage(this.image);
            }
            const { statusCode, stdout, stderr } = yield docker.runContainer(this.image, this.getContainerArgs(), {
                binds: this.getDockerArgs()
            });
            return {
                statusCode,
                stdout: Buffer.from(stdout.toString()),
                stderr: Buffer.from(stderr.toString())
            };
        });
    }
}
exports.DockerCairo1Compiler = DockerCairo1Compiler;
//# sourceMappingURL=cairo1-compiler.js.map