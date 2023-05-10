import { Devnet, HardhatRuntimeEnvironment } from "hardhat/types";
import { L2ToL1Message } from "./starknet-types";
import { Numeric } from "./types";
interface L1ToL2Message {
    address: string;
    args: {
        from_address: string;
        nonce: number;
        payload: Array<number>;
        selector: string;
        to_address: string;
    };
    block_hash: string;
    block_number: number;
    event: string;
    log_index: number;
    transaction_hash: string;
    transaction_index: number;
}
export interface FlushResponse {
    l1_provider: string;
    consumed_messages: {
        from_l1: Array<L1ToL2Message>;
        from_l2: Array<L2ToL1Message>;
    };
}
export interface LoadL1MessagingContractResponse {
    address: string;
    l1_provider: string;
}
export interface L1ToL2MockTxRequest {
    l2_contract_address: string;
    l1_contract_address: string;
    entry_point_selector: string;
    payload: Array<number>;
    nonce: string;
    paidFeeOnL1: string;
}
export interface L1ToL2MockTxResponse {
    transaction_hash: string;
}
export interface L2ToL1MockTxRequest {
    l2_contract_address: string;
    l1_contract_address: string;
    payload: Array<number>;
}
export interface L2ToL1MockTxResponse {
    message_hash: string;
}
export interface SetTimeResponse {
    block_timestamp: number;
}
export interface NewBlockResponse {
    block_hash: string;
}
export interface IncreaseTimeResponse {
    timestamp_increased_by: number;
    block_hash: string;
}
export interface PredeployedAccount {
    initial_balance: number;
    private_key: string;
    public_key: string;
    address: string;
}
export declare class DevnetUtils implements Devnet {
    private hre;
    private axiosInstance;
    constructor(hre: HardhatRuntimeEnvironment);
    private get endpoint();
    private requestHandler;
    restart(): Promise<void>;
    flush(): Promise<any>;
    loadL1MessagingContract(networkUrl: string, address?: string, networkId?: string): Promise<any>;
    sendMessageToL2(l2ContractAddress: string, functionName: string, l1ContractAddress: string, payload: Numeric[], nonce: Numeric, paidFeeOnL1: Numeric): Promise<any>;
    consumeMessageFromL2(l2ContractAddress: string, l1ContractAddress: string, payload: number[]): Promise<any>;
    increaseTime(seconds: number): Promise<any>;
    setTime(seconds: number): Promise<any>;
    getPredeployedAccounts(): Promise<any>;
    dump(path: string): Promise<any>;
    load(path: string): Promise<any>;
    createBlock(): Promise<any>;
    mint(address: string, amount: number, lite?: boolean): Promise<any>;
}
export {};
