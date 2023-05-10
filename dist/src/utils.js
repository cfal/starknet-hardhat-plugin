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
exports.findConstructor = exports.estimatedFeeToMaxFee = exports.bnToDecimalStringArray = exports.formatSpaces = exports.readCairo1Contract = exports.readContract = exports.UDC = exports.generateRandomSalt = exports.numericToHexString = exports.warn = exports.sleep = exports.getImageTagByArch = exports.copyWithBigint = exports.getAccountPath = exports.findPath = exports.isStarknetDevnet = exports.getNetwork = exports.checkArtifactExists = exports.adaptPath = exports.getArtifactPath = exports.traverseFiles = exports.getDefaultHardhatNetworkConfig = exports.getDefaultHttpNetworkConfig = exports.adaptLog = void 0;
const fs_1 = __importDefault(require("fs"));
const glob_1 = require("glob");
const path_1 = __importDefault(require("path"));
const starknet_1 = require("starknet");
const account_utils_1 = require("./account-utils");
const constants_1 = require("./constants");
const extend_utils_1 = require("./extend-utils");
const starknet_plugin_error_1 = require("./starknet-plugin-error");
const types_1 = require("./types");
/**
 * Replaces Starknet specific terminology with the terminology used in this plugin.
 *
 * @param msg the log message to be adapted
 * @returns the log message with adaptation replacements
 */
function adaptLog(msg) {
    return msg
        .replace("--network", "--starknet-network")
        .replace("gateway_url", "gateway-url")
        .replace("--account_contract", "--account-contract")
        .replace("the 'starknet deploy_account' command", "'hardhat starknet-deploy-account'")
        .replace("the 'new_account' command", "'hardhat starknet-new-account'")
        .split(".\nTraceback (most recent call last)")[0] // remove duplicated log
        .replace(/\\n/g, "\n"); // use newlines from json response for formatting
}
exports.adaptLog = adaptLog;
function getDefaultHttpNetworkConfig(url, verificationUrl, verifiedUrl, starknetChainId) {
    return {
        url,
        verificationUrl,
        verifiedUrl,
        starknetChainId,
        accounts: undefined,
        gas: undefined,
        gasMultiplier: undefined,
        gasPrice: undefined,
        httpHeaders: undefined,
        timeout: undefined
    };
}
exports.getDefaultHttpNetworkConfig = getDefaultHttpNetworkConfig;
function getDefaultHardhatNetworkConfig(url) {
    return {
        url,
        chainId: undefined,
        gas: undefined,
        gasPrice: undefined,
        gasMultiplier: undefined,
        hardfork: undefined,
        mining: undefined,
        accounts: undefined,
        blockGasLimit: undefined,
        minGasPrice: undefined,
        throwOnTransactionFailures: undefined,
        throwOnCallFailures: undefined,
        allowUnlimitedContractSize: undefined,
        initialDate: undefined,
        loggingEnabled: undefined,
        chains: undefined
    };
}
exports.getDefaultHardhatNetworkConfig = getDefaultHardhatNetworkConfig;
function traverseFiles(traversable, fileCriteria = "*") {
    return __awaiter(this, void 0, void 0, function* () {
        let paths = [];
        if (fs_1.default.lstatSync(traversable).isDirectory()) {
            paths = yield (0, glob_1.glob)(path_1.default.join(traversable, "**", fileCriteria));
        }
        else {
            paths.push(traversable);
        }
        const files = paths.filter((file) => fs_1.default.lstatSync(file).isFile());
        return files;
    });
}
exports.traverseFiles = traverseFiles;
function getArtifactPath(sourcePath, paths) {
    const rootRegex = new RegExp("^" + paths.root);
    const suffix = sourcePath.replace(rootRegex, "");
    return path_1.default.join(paths.starknetArtifacts, suffix);
}
exports.getArtifactPath = getArtifactPath;
/**
 * Adapts path relative to the root of the project and
 * tilde will be resolved to homedir
 * @param root string representing the root path set on hre or config
 * @param newPath string representing the path provided by the user
 * @returns adapted path
 */
function adaptPath(root, newPath) {
    let adaptedPath = newPath;
    if (newPath[0] === "~") {
        adaptedPath = path_1.default.normalize(path_1.default.join(process.env.HOME, newPath.slice(1)));
    }
    else if (!path_1.default.isAbsolute(newPath)) {
        adaptedPath = path_1.default.normalize(path_1.default.join(root, newPath));
    }
    return adaptedPath;
}
exports.adaptPath = adaptPath;
function checkArtifactExists(artifactsPath) {
    if (!fs_1.default.existsSync(artifactsPath)) {
        const msg = `Artifact expected to be at ${artifactsPath}, but not found. Consider recompiling your contracts.`;
        throw new starknet_plugin_error_1.StarknetPluginError(msg);
    }
}
exports.checkArtifactExists = checkArtifactExists;
/**
 * Extracts the network config from `hre.config.networks` according to `networkName`.
 * @param networkName The name of the network
 * @param networks Object holding network configs
 * @param origin Short string describing where/how `networkName` was specified
 * @returns Network config corresponding to `networkName`
 */
function getNetwork(networkName, networks, origin) {
    if (isMainnet(networkName)) {
        networkName = constants_1.ALPHA_MAINNET_INTERNALLY;
    }
    else if (isTestnet(networkName)) {
        networkName = constants_1.ALPHA_TESTNET_INTERNALLY;
    }
    else if (isTestnetTwo(networkName)) {
        networkName = constants_1.ALPHA_TESTNET_2_INTERNALLY;
    }
    else if (isStarknetDevnet(networkName)) {
        networkName = constants_1.INTEGRATED_DEVNET_INTERNALLY;
    }
    const network = networks[networkName];
    if (!network) {
        const available = Object.keys(networks).join(", ");
        const msg = `Invalid network provided in ${origin}: ${networkName}.\nValid hardhat networks: ${available}`;
        throw new starknet_plugin_error_1.StarknetPluginError(msg);
    }
    if (!network.url) {
        throw new starknet_plugin_error_1.StarknetPluginError(`Cannot use network ${networkName}. No "url" specified.`);
    }
    network.starknetChainId || (network.starknetChainId = constants_1.StarknetChainId.TESTNET);
    network.vmLang || (network.vmLang = constants_1.DEFAULT_DEVNET_CAIRO_VM);
    return network;
}
exports.getNetwork = getNetwork;
function isTestnet(networkName) {
    return networkName === constants_1.ALPHA_TESTNET || networkName === constants_1.ALPHA_TESTNET_INTERNALLY;
}
function isTestnetTwo(networkName) {
    return networkName === constants_1.ALPHA_TESTNET_2 || networkName === constants_1.ALPHA_TESTNET_2_INTERNALLY;
}
function isMainnet(networkName) {
    return networkName === constants_1.ALPHA_MAINNET || networkName === constants_1.ALPHA_MAINNET_INTERNALLY;
}
function isStarknetDevnet(networkName) {
    return networkName === constants_1.INTEGRATED_DEVNET || networkName === constants_1.INTEGRATED_DEVNET_INTERNALLY;
}
exports.isStarknetDevnet = isStarknetDevnet;
function findPath(traversable, pathSegment) {
    return __awaiter(this, void 0, void 0, function* () {
        // Relative path to artifacts can be resolved now
        const resolvedPath = path_1.default.resolve(path_1.default.join(traversable, pathSegment));
        if (fs_1.default.existsSync(resolvedPath) && fs_1.default.lstatSync(resolvedPath).isFile()) {
            return resolvedPath;
        }
        let files = yield traverseFiles(traversable);
        files = files.filter((f) => f.endsWith(pathSegment));
        if (files.length == 0) {
            return null;
        }
        else if (files.length == 1) {
            return files[0];
        }
        else {
            const msg = "More than one file was found because the path provided is ambiguous, please specify a relative path";
            throw new starknet_plugin_error_1.StarknetPluginError(msg);
        }
    });
}
exports.findPath = findPath;
/**
 *
 * @param accountPath Path where the account file is saved
 * @param hre The HardhatRuntimeEnvironment
 * @returns Absolute path where the account file is saved
 */
function getAccountPath(accountPath, hre) {
    let accountDir = accountPath || constants_1.DEFAULT_STARKNET_ACCOUNT_PATH;
    // Adapt path to be absolute
    if (accountDir[0] === "~") {
        accountDir = path_1.default.normalize(path_1.default.join(process.env.HOME, accountDir.slice(1)));
    }
    else if (!path_1.default.isAbsolute(accountDir)) {
        const root = hre.config.paths.root;
        accountDir = path_1.default.normalize(path_1.default.join(root, accountDir));
    }
    return accountDir;
}
exports.getAccountPath = getAccountPath;
function copyWithBigint(object) {
    return JSON.parse(JSON.stringify(object, (_key, value) => typeof value === "bigint" ? value.toString() : value));
}
exports.copyWithBigint = copyWithBigint;
function getImageTagByArch(tag) {
    // Check CPU architecture
    const arch = process.arch;
    if (arch === "arm64" && !tag.endsWith("-arm")) {
        tag = `${tag}-arm`;
    }
    return tag;
}
exports.getImageTagByArch = getImageTagByArch;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.sleep = sleep;
/**
 * Log a yellow message to STDERR.
 * @param message
 */
function warn(message) {
    console.warn("\x1b[33m%s\x1b[0m", message);
}
exports.warn = warn;
/**
 * Converts BigInt to 0x-prefixed hex string
 * @param numeric
 */
function numericToHexString(numeric) {
    return "0x" + BigInt(numeric).toString(16);
}
exports.numericToHexString = numericToHexString;
/**
 * @returns random salt
 */
function generateRandomSalt() {
    return starknet_1.stark.randomAddress();
}
exports.generateRandomSalt = generateRandomSalt;
/**
 * Global handler of UDC
 */
class UDC {
    /**
     * Returns the UDC singleton.
     */
    static getInstance() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!UDC.instance) {
                const hre = yield Promise.resolve().then(() => __importStar(require("hardhat")));
                const contractPath = (0, account_utils_1.handleInternalContractArtifacts)("OpenZeppelinUDC", // dir name
                "UDC", // file name
                "0.5.0", // version
                hre);
                const udcContractFactory = yield (0, extend_utils_1.getContractFactoryUtil)(hre, contractPath);
                UDC.instance = udcContractFactory.getContractAt(constants_1.UDC_ADDRESS);
            }
            return UDC.instance;
        });
    }
}
exports.UDC = UDC;
function readContract(contractPath) {
    const parsedContract = starknet_1.json.parse(fs_1.default.readFileSync(contractPath).toString("ascii"));
    return Object.assign(Object.assign({}, parsedContract), { program: starknet_1.stark.compressProgram(parsedContract.program) });
}
exports.readContract = readContract;
function readCairo1Contract(contractPath) {
    const parsedContract = starknet_1.json.parse(fs_1.default.readFileSync(contractPath).toString("ascii"));
    const { contract_class_version, entry_points_by_type, sierra_program } = parsedContract;
    const contract = new types_1.Cairo1ContractClass({
        abiPath: path_1.default.join(path_1.default.dirname(contractPath), `${path_1.default.parse(contractPath).name}${constants_1.ABI_SUFFIX}`),
        sierraProgram: starknet_1.stark.compressProgram(formatSpaces(JSON.stringify(sierra_program))),
        entryPointsByType: entry_points_by_type,
        contractClassVersion: contract_class_version
    });
    return contract;
}
exports.readCairo1Contract = readCairo1Contract;
/**
 * Json string is transformed into a formatted string without newlines.
 * @param json string
 * @returns string
 */
function formatSpaces(json) {
    let insideQuotes = false;
    let newString = "";
    for (const char of json) {
        // eslint-disable-next-line
        if (char === '"' && newString.endsWith("\\") === false) {
            insideQuotes = !insideQuotes;
        }
        if (insideQuotes) {
            newString += char;
        }
        else {
            newString += char === ":" ? ": " : char === "," ? ", " : char;
        }
    }
    return newString;
}
exports.formatSpaces = formatSpaces;
function bnToDecimalStringArray(rawCalldata) {
    return rawCalldata.map((x) => x.toString(10));
}
exports.bnToDecimalStringArray = bnToDecimalStringArray;
function estimatedFeeToMaxFee(amount, overhead = 0.5) {
    overhead = Math.round((1 + overhead) * 100);
    return (amount * BigInt(overhead)) / BigInt(100);
}
exports.estimatedFeeToMaxFee = estimatedFeeToMaxFee;
function findConstructor(abi, predicate) {
    for (const abiEntryName in abi) {
        const abiEntry = abi[abiEntryName];
        if (predicate(abiEntry)) {
            return abiEntry;
        }
    }
    return undefined;
}
exports.findConstructor = findConstructor;
//# sourceMappingURL=utils.js.map