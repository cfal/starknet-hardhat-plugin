/// <reference types="bn.js" />
import { ec } from "elliptic";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StarknetChainId } from "./constants";
import * as starknet from "./starknet-types";
import { Cairo1ContractClass, Numeric, StarknetContract, StringMap } from "./types";
export type CallParameters = {
    toContract: StarknetContract;
    functionName: string;
    calldata?: StringMap;
};
type KeysType = {
    publicKey: string;
    privateKey: string;
    keyPair: ec.KeyPair;
};
export declare function generateRandomStarkPrivateKey(length?: number): import("bn.js");
export declare function signMultiCall(publicKey: string, keyPair: ec.KeyPair, messageHash: string): bigint[];
/**
 * Move from an internal directory to the user's artifacts.
 * @param contractDir the subdirectory internally holding the artifact
 * @returns the new path where the artifacts can be found
 */
export declare function handleInternalContractArtifacts(contractDir: string, contractName: string, artifactsVersion: string, hre: HardhatRuntimeEnvironment): string;
/**
 * If no privateKey provided, generates random values, otherwise calculates from the
 * provided key.
 * @param providedPrivateKey hex string private key to use for generating the public key
 * @returns an object with public, private key and key pair
 */
export declare function generateKeys(providedPrivateKey?: string): KeysType;
export declare function calculateDeployAccountHash(accountAddress: string, constructorCalldata: string[], salt: string, classHash: string, maxFee: string, chainId: StarknetChainId): string;
export declare function sendDeployAccountTx(signatures: string[], classHash: string, constructorCalldata: string[], salt: string, maxFee: string): Promise<string>;
export declare function calculateDeclareV2TxHash(accountAddress: string, callData: string[], maxFee: string, chainId: StarknetChainId, additionalData: string[]): string;
export declare function sendDeclareV2Tx(signatures: string[], compiledClassHash: string, maxFee: Numeric, senderAddress: string, version: Numeric, nonce: Numeric, contractClass: Cairo1ContractClass): Promise<string>;
export declare function sendEstimateFeeTx(data: unknown): Promise<starknet.FeeEstimation>;
export {};
