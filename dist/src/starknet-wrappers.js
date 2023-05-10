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
exports.VenvWrapper = exports.DockerWrapper = exports.StarknetWrapper = void 0;
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
const starknet_1 = require("starknet");
const cairo1_compiler_1 = require("./cairo1-compiler");
const constants_1 = require("./constants");
const starknet_docker_proxy_1 = require("./starknet-docker-proxy");
const starknet_plugin_error_1 = require("./starknet-plugin-error");
const starknet_venv_proxy_1 = require("./starknet-venv-proxy");
const venv_1 = require("./utils/venv");
class StarknetWrapper {
    constructor(externalServer, hre) {
        this.externalServer = externalServer;
        this.hre = hre;
        // this is dangerous since hre get set here, before being fully initialized (e.g. active network not yet set)
        // it's dangerous because in getters (e.g. get gatewayUrl) we rely on it being initialized
    }
    get gatewayUrl() {
        const url = this.hre.starknet.networkConfig.url;
        if (this.externalServer.isDockerDesktop) {
            for (const protocol of ["http://", "https://", ""]) {
                for (const host of ["localhost", "127.0.0.1"]) {
                    if (url === `${protocol}${host}`) {
                        return `${protocol}${constants_1.DOCKER_HOST}`;
                    }
                    const prefix = `${protocol}${host}:`;
                    if (url.startsWith(prefix)) {
                        return url.replace(prefix, `${protocol}${constants_1.DOCKER_HOST}:`);
                    }
                }
            }
        }
        return url;
    }
    get chainID() {
        return this.hre.starknet.networkConfig.starknetChainId;
    }
    get networkID() {
        return this.hre.starknet.network;
    }
    execute(command, args) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.externalServer.post({
                command,
                args
            });
        });
    }
    prepareDeprecatedCompileOptions(options) {
        const ret = [
            options.file,
            "--abi",
            options.abi,
            "--output",
            options.output,
            "--cairo_path",
            options.cairoPath
        ];
        if (options.accountContract) {
            ret.push("--account_contract");
        }
        if (options.disableHintValidation) {
            ret.push("--disable_hint_validation");
        }
        return ret;
    }
    deprecatedCompile(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const preparedOptions = this.prepareDeprecatedCompileOptions(options);
            const executed = yield this.execute("starknet-compile-deprecated", preparedOptions);
            return executed;
        });
    }
    prepareDeclareOptions(options) {
        const prepared = [
            "declare",
            "--deprecated",
            "--contract",
            options.contract,
            "--gateway_url",
            this.gatewayUrl,
            "--feeder_gateway_url",
            this.gatewayUrl,
            "--no_wallet"
        ];
        if (options.signature && options.signature.length) {
            prepared.push("--signature", ...options.signature);
        }
        if (options.token) {
            prepared.push("--token", options.token);
        }
        if (options.sender) {
            prepared.push("--sender", options.sender);
        }
        if (options.maxFee == null) {
            throw new starknet_plugin_error_1.StarknetPluginError("No maxFee provided for declare tx");
        }
        prepared.push("--chain_id", this.chainID);
        prepared.push("--max_fee", options.maxFee);
        if (options.nonce) {
            prepared.push("--nonce", options.nonce);
        }
        return prepared;
    }
    declare(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const preparedOptions = this.prepareDeclareOptions(options);
            const executed = yield this.execute("starknet", preparedOptions);
            return executed;
        });
    }
    prepareCairoToSierraOptions(options) {
        const args = [];
        if ((options === null || options === void 0 ? void 0 : options.replaceIds) === true) {
            args.push("-r");
        }
        if (options.allowedLibfuncsListName) {
            args.push("--allowed-libfuncs-list-name", options.allowedLibfuncsListName);
        }
        if (options.allowedLibfuncsListFile) {
            args.push("--allowed-libfuncs-list-file", options.allowedLibfuncsListFile);
        }
        args.push(options.path);
        if (options.output) {
            args.push(options.output);
        }
        return args;
    }
    prepareSierraToCasmOptions(options) {
        const args = [];
        if (options.allowedLibfuncsListName) {
            args.push("--allowed-libfuncs-list-name", options.allowedLibfuncsListName);
        }
        if (options.allowedLibfuncsListFile) {
            args.push("--allowed-libfuncs-list-file", options.allowedLibfuncsListFile);
        }
        if ((options === null || options === void 0 ? void 0 : options.addPythonicHints) === true) {
            args.push("--add-pythonic-hints");
        }
        args.push(options.file);
        if (options.output) {
            args.push(options.output);
        }
        return args;
    }
    getCairo1Command(binDirPath, binCommand, args) {
        if (!binDirPath) {
            const msg = "No compiler bin directory specified\n" +
                "Specify one of {dockerizedVersion,cairo1BinDir} in the hardhat config file OR --cairo1-bin-dir in the CLI";
            throw new starknet_plugin_error_1.StarknetPluginError(msg);
        }
        const cairo1Bin = path_1.default.join(binDirPath, binCommand);
        return [cairo1Bin, ...args];
    }
    prepareInteractOptions(options) {
        const prepared = [
            ...options.choice.cliCommand,
            "--feeder_gateway_url",
            this.gatewayUrl,
            "--gateway_url",
            this.gatewayUrl,
            "--function",
            options.functionName,
            "--address",
            options.address
        ];
        if (options.abi) {
            prepared.push("--abi", options.abi);
        }
        if (options.inputs && options.inputs.length) {
            prepared.push("--inputs", ...options.inputs);
        }
        if (options.signature && options.signature.length) {
            prepared.push("--signature", ...options.signature);
        }
        if (options.blockNumber != null) {
            prepared.push("--block_number", options.blockNumber.toString());
        }
        prepared.push("--chain_id", this.chainID);
        if (options.wallet) {
            prepared.push("--wallet", options.wallet);
            prepared.push("--network_id", this.networkID);
            if (options.account) {
                prepared.push("--account", options.account);
            }
            if (options.accountDir) {
                prepared.push("--account_dir", options.accountDir);
            }
        }
        else {
            prepared.push("--no_wallet");
        }
        if (options.choice.allowsMaxFee && options.maxFee) {
            prepared.push("--max_fee", options.maxFee);
        }
        if (options.nonce) {
            prepared.push("--nonce", options.nonce);
        }
        return prepared;
    }
    prepareTxQueryOptions(command, options) {
        return [
            command,
            "--hash",
            options.hash,
            "--gateway_url",
            this.gatewayUrl,
            "--feeder_gateway_url",
            this.gatewayUrl
        ];
    }
    getTxStatus(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const preparedOptions = this.prepareTxQueryOptions("tx_status", options);
            const executed = yield this.execute("starknet", preparedOptions);
            return executed;
        });
    }
    getTransactionTrace(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const preparedOptions = this.prepareTxQueryOptions("get_transaction_trace", options);
            const executed = yield this.execute("starknet", preparedOptions);
            return executed;
        });
    }
    prepareDeployAccountOptions(options) {
        const prepared = [
            "deploy_account",
            "--network_id",
            options.network,
            "--account",
            options.accountName || "__default__",
            "--gateway_url",
            this.gatewayUrl,
            "--feeder_gateway_url",
            this.gatewayUrl
        ];
        if (options.wallet) {
            prepared.push("--wallet", options.wallet);
        }
        if (options.accountDir) {
            prepared.push("--account_dir", options.accountDir);
        }
        prepared.push("--chain_id", this.chainID);
        return prepared;
    }
    deployAccount(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const preparedOptions = this.prepareDeployAccountOptions(options);
            const executed = yield this.execute("starknet", preparedOptions);
            return executed;
        });
    }
    prepareNewAccountOptions(options) {
        const prepared = [
            "new_account",
            "--network_id",
            options.network,
            "--account",
            options.accountName || "__default__",
            "--gateway_url",
            this.gatewayUrl,
            "--feeder_gateway_url",
            this.gatewayUrl
        ];
        if (options.wallet) {
            prepared.push("--wallet", options.wallet);
        }
        if (options.accountDir) {
            prepared.push("--account_dir", options.accountDir);
        }
        return prepared;
    }
    newAccount(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const preparedOptions = this.prepareNewAccountOptions(options);
            const executed = this.execute("starknet", preparedOptions);
            return executed;
        });
    }
    getTransactionReceipt(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const preparedOptions = this.prepareTxQueryOptions("get_transaction_receipt", options);
            const executed = yield this.execute("starknet", preparedOptions);
            return executed;
        });
    }
    getTransaction(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const preparedOptions = this.prepareTxQueryOptions("get_transaction", options);
            const executed = yield this.execute("starknet", preparedOptions);
            return executed;
        });
    }
    prepareBlockQueryOptions(options) {
        const commandArr = [
            "get_block",
            "--gateway_url",
            this.gatewayUrl,
            "--feeder_gateway_url",
            this.gatewayUrl
        ];
        if (options === null || options === void 0 ? void 0 : options.hash) {
            commandArr.push("--hash");
            commandArr.push(options.hash);
        }
        if (options === null || options === void 0 ? void 0 : options.number) {
            commandArr.push("--number");
            commandArr.push(options.number.toString());
        }
        return commandArr;
    }
    getBlock(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const preparedOptions = this.prepareBlockQueryOptions(options);
            const executed = yield this.execute("starknet", preparedOptions);
            return executed;
        });
    }
    prepareNonceQueryOptions(options) {
        const commandArr = [
            "get_nonce",
            "--feeder_gateway_url",
            this.gatewayUrl,
            "--contract_address",
            options.address
        ];
        if (options.blockHash) {
            commandArr.push("--block_hash", options.blockHash);
        }
        if (options.blockNumber != null) {
            commandArr.push("--block_number", options.blockNumber.toString());
        }
        return commandArr;
    }
    getNonce(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const preparedOptions = this.prepareNonceQueryOptions(options);
            const executed = yield this.execute("starknet", preparedOptions);
            return executed;
        });
    }
    getClassHash(artifactPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const executed = yield this.execute("get_class_hash", [artifactPath]);
            if (executed.statusCode) {
                throw new starknet_plugin_error_1.StarknetPluginError(executed.stderr.toString());
            }
            return executed.stdout.toString().trim();
        });
    }
    getCompiledClassHash(casmPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const executed = yield this.execute("get_compiled_class_hash", [casmPath]);
            if (executed.statusCode) {
                throw new starknet_plugin_error_1.StarknetPluginError(executed.stderr.toString());
            }
            return executed.stdout.toString().trim();
        });
    }
    getSierraContractClassHash(casmPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const executed = yield this.execute("get_contract_class_hash", [casmPath]);
            if (executed.statusCode) {
                throw new starknet_plugin_error_1.StarknetPluginError(executed.stderr.toString());
            }
            return executed.stdout.toString().trim();
        });
    }
    migrateContract(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const commandArr = [...options.files];
            if (options.inplace) {
                commandArr.push("-i");
            }
            const executed = yield this.execute("cairo-migrate", commandArr);
            if (executed.statusCode) {
                throw new starknet_plugin_error_1.StarknetPluginError(executed.stderr.toString());
            }
            return executed;
        });
    }
    estimateMessageFee(functionName, fromAddress, toAddress, inputs) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = {
                from_address: fromAddress,
                to_address: toAddress,
                entry_point_selector: starknet_1.hash.getSelectorFromName(functionName),
                payload: inputs.map((item) => starknet_1.number.toHex(starknet_1.number.toBN(item)))
            };
            const response = yield axios_1.default.post(`${this.hre.starknet.networkConfig.url}/feeder_gateway/estimate_message_fee`, body);
            const { gas_price, gas_usage, overall_fee, unit } = response.data;
            return {
                amount: BigInt(overall_fee),
                unit,
                gas_price: BigInt(gas_price),
                gas_usage: BigInt(gas_usage)
            };
        });
    }
}
exports.StarknetWrapper = StarknetWrapper;
function getFullImageName(image) {
    return `${image.repository}:${image.tag}`;
}
class DockerWrapper extends StarknetWrapper {
    constructor(image, rootPath, accountPaths, cairoPaths, hre) {
        const externalServer = new starknet_docker_proxy_1.StarknetDockerProxy(image, rootPath, accountPaths, cairoPaths);
        super(externalServer, hre);
        this.image = image;
        this.rootPath = rootPath;
        console.log(`${constants_1.PLUGIN_NAME} plugin using dockerized environment (${getFullImageName(image)})`);
    }
    compileCairoToSierra(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = this.prepareCairoToSierraOptions(options);
            const command = this.getCairo1Command(constants_1.DOCKER_HOST_BIN_PATH, constants_1.CAIRO1_COMPILE_BIN, args);
            const externalServer = new cairo1_compiler_1.DockerCairo1Compiler(this.image, [this.rootPath], command);
            return yield externalServer.compileCairo1();
        });
    }
    compileSierraToCasm(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = this.prepareSierraToCasmOptions(options);
            const command = this.getCairo1Command(constants_1.DOCKER_HOST_BIN_PATH, constants_1.CAIRO1_SIERRA_COMPILE_BIN, args);
            const externalServer = new cairo1_compiler_1.DockerCairo1Compiler(this.image, [this.rootPath], command);
            return yield externalServer.compileCairo1();
        });
    }
    interact(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const preparedOptions = this.prepareInteractOptions(options);
            const executed = this.execute("starknet", preparedOptions);
            return executed;
        });
    }
}
exports.DockerWrapper = DockerWrapper;
class VenvWrapper extends StarknetWrapper {
    constructor(venvPath, hre) {
        let pythonPath;
        if (venvPath === "active") {
            console.log(`${constants_1.PLUGIN_NAME} plugin using the active environment.`);
            pythonPath = "python3";
        }
        else {
            venvPath = (0, venv_1.normalizeVenvPath)(venvPath);
            console.log(`${constants_1.PLUGIN_NAME} plugin using environment at ${venvPath}`);
            pythonPath = (0, venv_1.getPrefixedCommand)(venvPath, "python3");
        }
        super(new starknet_venv_proxy_1.StarknetVenvProxy(pythonPath), hre);
    }
    get gatewayUrl() {
        return this.hre.starknet.networkConfig.url;
    }
    compileCairoToSierra(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = this.prepareCairoToSierraOptions(options);
            const command = this.getCairo1Command(options.binDirPath, constants_1.CAIRO1_COMPILE_BIN, args);
            const executed = (0, cairo1_compiler_1.exec)(command.join(" "));
            return executed;
        });
    }
    compileSierraToCasm(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = this.prepareSierraToCasmOptions(options);
            const command = this.getCairo1Command(options.binDirPath, constants_1.CAIRO1_SIERRA_COMPILE_BIN, args);
            const executed = (0, cairo1_compiler_1.exec)(command.join(" "));
            return executed;
        });
    }
    interact(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const preparedOptions = this.prepareInteractOptions(options);
            const executed = yield this.execute("starknet", preparedOptions);
            return executed;
        });
    }
}
exports.VenvWrapper = VenvWrapper;
//# sourceMappingURL=starknet-wrappers.js.map