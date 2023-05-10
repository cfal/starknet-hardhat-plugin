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
exports.getBalanceUtil = exports.getNonceUtil = exports.getBlockUtil = exports.getTransactionTraceUtil = exports.getTransactionReceiptUtil = exports.getTransactionUtil = exports.getWalletUtil = exports.bigIntToShortStringUtil = exports.shortStringToBigIntUtil = exports.getContractFactoryUtil = void 0;
const path_1 = __importDefault(require("path"));
const starknet_1 = require("starknet");
const account_utils_1 = require("./account-utils");
const constants_1 = require("./constants");
const starknet_plugin_error_1 = require("./starknet-plugin-error");
const types_1 = require("./types");
const utils_1 = require("./utils");
function getContractFactoryUtil(hre, contractPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const artifactsPath = hre.config.paths.starknetArtifacts;
        (0, utils_1.checkArtifactExists)(artifactsPath);
        contractPath = contractPath.replace(/\.[^/.]+$/, ""); // remove extension
        const metadataSearchTarget = path_1.default.join(`${contractPath}.cairo`, `${path_1.default.basename(contractPath)}.json`);
        const metadataPath = yield (0, utils_1.findPath)(artifactsPath, metadataSearchTarget);
        if (!metadataPath) {
            throw new starknet_plugin_error_1.StarknetPluginError(`Could not find JSON artifact for "${contractPath}.cairo". Consider recompiling your contracts.`);
        }
        const casmSearchTarget = path_1.default.join(`${contractPath}.cairo`, `${path_1.default.basename(contractPath)}${constants_1.CAIRO1_ASSEMBLY_SUFFIX}`);
        const casmPath = yield (0, utils_1.findPath)(artifactsPath, casmSearchTarget);
        const abiSearchTarget = path_1.default.join(`${contractPath}.cairo`, `${path_1.default.basename(contractPath)}${constants_1.ABI_SUFFIX}`);
        const abiPath = yield (0, utils_1.findPath)(artifactsPath, abiSearchTarget);
        if (!abiPath) {
            throw new starknet_plugin_error_1.StarknetPluginError(`Could not find ABI JSON artifact for "${contractPath}.cairo". Consider recompiling your contracts.`);
        }
        return new types_1.StarknetContractFactory({
            metadataPath,
            casmPath,
            abiPath,
            hre
        });
    });
}
exports.getContractFactoryUtil = getContractFactoryUtil;
function shortStringToBigIntUtil(convertableString) {
    if (!convertableString) {
        throw new starknet_plugin_error_1.StarknetPluginError("A non-empty string must be provided");
    }
    if (convertableString.length > constants_1.SHORT_STRING_MAX_CHARACTERS) {
        const msg = `Short strings must have a max of ${constants_1.SHORT_STRING_MAX_CHARACTERS} characters.`;
        throw new starknet_plugin_error_1.StarknetPluginError(msg);
    }
    const invalidChars = {};
    const charArray = [];
    for (const c of convertableString.split("")) {
        const charCode = c.charCodeAt(0);
        if (charCode > 127) {
            invalidChars[c] = true;
        }
        charArray.push(charCode.toString(16));
    }
    const invalidCharArray = Object.keys(invalidChars);
    if (invalidCharArray.length) {
        const msg = `Non-standard-ASCII character${invalidCharArray.length === 1 ? "" : "s"}: ${invalidCharArray.join(", ")}`;
        throw new starknet_plugin_error_1.StarknetPluginError(msg);
    }
    return BigInt("0x" + charArray.join(""));
}
exports.shortStringToBigIntUtil = shortStringToBigIntUtil;
function bigIntToShortStringUtil(convertableBigInt) {
    return Buffer.from(convertableBigInt.toString(16), "hex").toString();
}
exports.bigIntToShortStringUtil = bigIntToShortStringUtil;
function getWalletUtil(name, hre) {
    const wallet = hre.config.starknet.wallets[name];
    if (!wallet) {
        const available = Object.keys(hre.config.starknet.wallets).join(", ");
        const msg = `Invalid wallet name provided: ${name}.\nValid wallets: ${available}`;
        throw new starknet_plugin_error_1.StarknetPluginError(msg);
    }
    wallet.accountPath = (0, utils_1.getAccountPath)(wallet.accountPath, hre);
    return wallet;
}
exports.getWalletUtil = getWalletUtil;
function getTransactionUtil(txHash, hre) {
    return __awaiter(this, void 0, void 0, function* () {
        const executed = yield hre.starknetWrapper.getTransaction({
            hash: txHash
        });
        if (executed.statusCode) {
            const msg = `Could not get the transaction. ${executed.stderr.toString()}`;
            throw new starknet_plugin_error_1.StarknetPluginError(msg);
        }
        const txReceipt = JSON.parse(executed.stdout.toString());
        return txReceipt;
    });
}
exports.getTransactionUtil = getTransactionUtil;
function getTransactionReceiptUtil(txHash, hre) {
    return __awaiter(this, void 0, void 0, function* () {
        const executed = yield hre.starknetWrapper.getTransactionReceipt({
            hash: txHash
        });
        if (executed.statusCode) {
            const msg = `Could not get the transaction receipt. Error: ${executed.stderr.toString()}`;
            throw new starknet_plugin_error_1.StarknetPluginError(msg);
        }
        const txReceipt = JSON.parse(executed.stdout.toString());
        return txReceipt;
    });
}
exports.getTransactionReceiptUtil = getTransactionReceiptUtil;
function getTransactionTraceUtil(txHash, hre) {
    return __awaiter(this, void 0, void 0, function* () {
        const executed = yield hre.starknetWrapper.getTransactionTrace({
            hash: txHash
        });
        if (executed.statusCode) {
            const msg = `Could not get the transaction trace. Error: ${executed.stderr.toString()}`;
            throw new starknet_plugin_error_1.StarknetPluginError(msg);
        }
        const txTrace = JSON.parse(executed.stdout.toString());
        return txTrace;
    });
}
exports.getTransactionTraceUtil = getTransactionTraceUtil;
function getBlockUtil(hre, identifier) {
    return __awaiter(this, void 0, void 0, function* () {
        const blockOptions = {
            feederGatewayUrl: hre.starknet.networkConfig.url,
            gatewayUrl: hre.starknet.networkConfig.url,
            number: identifier === null || identifier === void 0 ? void 0 : identifier.blockNumber,
            hash: identifier === null || identifier === void 0 ? void 0 : identifier.blockHash
        };
        if (identifier && typeof identifier !== "object") {
            const msg = `Invalid identifier provided to getBlock: ${identifier}`;
            throw new starknet_plugin_error_1.StarknetPluginError(msg);
        }
        if (blockOptions.number == null && !blockOptions.hash) {
            blockOptions.number = "latest";
        }
        const executed = yield hre.starknetWrapper.getBlock(blockOptions);
        if (executed.statusCode) {
            const msg = `Could not get block. Error: ${executed.stderr.toString()}`;
            throw new starknet_plugin_error_1.StarknetPluginError(msg);
        }
        const block = JSON.parse(executed.stdout.toString());
        return block;
    });
}
exports.getBlockUtil = getBlockUtil;
function getNonceUtil(hre, address, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const executed = yield hre.starknetWrapper.getNonce(Object.assign({ address }, options));
        if (executed.statusCode) {
            const msg = `Could not get nonce. Error: ${executed.stderr.toString()}`;
            throw new starknet_plugin_error_1.StarknetPluginError(msg);
        }
        return parseInt(executed.stdout.toString());
    });
}
exports.getNonceUtil = getNonceUtil;
function getBalanceUtil(address, hre) {
    return __awaiter(this, void 0, void 0, function* () {
        const contractPath = (0, account_utils_1.handleInternalContractArtifacts)("Token", "ERC20", "", hre);
        const contractFactory = yield hre.starknet.getContractFactory(contractPath);
        const ethContract = contractFactory.getContractAt(constants_1.ETH_ADDRESS);
        const result = yield ethContract.call("balanceOf", { account: address });
        const convertedBalance = starknet_1.uint256.uint256ToBN(result.balance).toString();
        return BigInt(convertedBalance);
    });
}
exports.getBalanceUtil = getBalanceUtil;
//# sourceMappingURL=extend-utils.js.map