import { Block, HardhatRuntimeEnvironment } from "hardhat/types";
import { Transaction, TransactionReceipt, TransactionTrace } from "./starknet-types";
import { BlockIdentifier, NonceQueryOptions, StarknetContractFactory } from "./types";
export declare function getContractFactoryUtil(hre: HardhatRuntimeEnvironment, contractPath: string): Promise<StarknetContractFactory>;
export declare function shortStringToBigIntUtil(convertableString: string): bigint;
export declare function bigIntToShortStringUtil(convertableBigInt: bigint): string;
export declare function getWalletUtil(name: string, hre: HardhatRuntimeEnvironment): import("./types/starknet").WalletConfig;
export declare function getTransactionUtil(txHash: string, hre: HardhatRuntimeEnvironment): Promise<Transaction>;
export declare function getTransactionReceiptUtil(txHash: string, hre: HardhatRuntimeEnvironment): Promise<TransactionReceipt>;
export declare function getTransactionTraceUtil(txHash: string, hre: HardhatRuntimeEnvironment): Promise<TransactionTrace>;
export declare function getBlockUtil(hre: HardhatRuntimeEnvironment, identifier?: BlockIdentifier): Promise<Block>;
export declare function getNonceUtil(hre: HardhatRuntimeEnvironment, address: string, options: NonceQueryOptions): Promise<number>;
export declare function getBalanceUtil(address: string, hre: HardhatRuntimeEnvironment): Promise<bigint>;