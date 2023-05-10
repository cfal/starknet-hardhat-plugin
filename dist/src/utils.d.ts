import { HardhatNetworkConfig, HardhatRuntimeEnvironment, HttpNetworkConfig, NetworkConfig, NetworksConfig, ProjectPathsConfig } from "hardhat/types";
import { StarknetChainId } from "./constants";
import { Abi, AbiEntry, CairoFunction } from "./starknet-types";
import { Cairo1ContractClass, Numeric, StarknetContract } from "./types";
/**
 * Replaces Starknet specific terminology with the terminology used in this plugin.
 *
 * @param msg the log message to be adapted
 * @returns the log message with adaptation replacements
 */
export declare function adaptLog(msg: string): string;
export declare function getDefaultHttpNetworkConfig(url: string, verificationUrl: string, verifiedUrl: string, starknetChainId: StarknetChainId): HttpNetworkConfig;
export declare function getDefaultHardhatNetworkConfig(url: string): HardhatNetworkConfig;
export declare function traverseFiles(traversable: string, fileCriteria?: string): Promise<string[]>;
export declare function getArtifactPath(sourcePath: string, paths: ProjectPathsConfig): string;
/**
 * Adapts path relative to the root of the project and
 * tilde will be resolved to homedir
 * @param root string representing the root path set on hre or config
 * @param newPath string representing the path provided by the user
 * @returns adapted path
 */
export declare function adaptPath(root: string, newPath: string): string;
export declare function checkArtifactExists(artifactsPath: string): void;
/**
 * Extracts the network config from `hre.config.networks` according to `networkName`.
 * @param networkName The name of the network
 * @param networks Object holding network configs
 * @param origin Short string describing where/how `networkName` was specified
 * @returns Network config corresponding to `networkName`
 */
export declare function getNetwork<N extends NetworkConfig>(networkName: string, networks: NetworksConfig, origin: string): N;
export declare function isStarknetDevnet(networkName: string): boolean;
export declare function findPath(traversable: string, pathSegment: string): Promise<string>;
/**
 *
 * @param accountPath Path where the account file is saved
 * @param hre The HardhatRuntimeEnvironment
 * @returns Absolute path where the account file is saved
 */
export declare function getAccountPath(accountPath: string, hre: HardhatRuntimeEnvironment): string;
export declare function copyWithBigint<T>(object: unknown): T;
export declare function getImageTagByArch(tag: string): string;
export declare function sleep(ms: number): Promise<unknown>;
/**
 * Log a yellow message to STDERR.
 * @param message
 */
export declare function warn(message: string): void;
/**
 * Converts BigInt to 0x-prefixed hex string
 * @param numeric
 */
export declare function numericToHexString(numeric: Numeric): string;
/**
 * @returns random salt
 */
export declare function generateRandomSalt(): string;
/**
 * Global handler of UDC
 */
export declare class UDC {
    private static instance;
    /**
     * Returns the UDC singleton.
     */
    static getInstance(): Promise<StarknetContract>;
}
export declare function readContract(contractPath: string): {
    program: string;
    abi: import("starknet").Abi;
    entry_points_by_type: object;
};
export declare function readCairo1Contract(contractPath: string): Cairo1ContractClass;
/**
 * Json string is transformed into a formatted string without newlines.
 * @param json string
 * @returns string
 */
export declare function formatSpaces(json: string): string;
export declare function bnToDecimalStringArray(rawCalldata: bigint[]): string[];
export declare function estimatedFeeToMaxFee(amount?: bigint, overhead?: number): bigint;
export declare function findConstructor(abi: Abi, predicate: (entry: AbiEntry) => boolean): CairoFunction;
