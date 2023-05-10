import { Image, ProcessResult } from "@nomiclabs/hardhat-docker";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ExternalServer } from "./external-server";
import { FeeEstimation } from "./starknet-types";
import { BlockNumber, InteractChoice } from "./types";
interface CompileWrapperOptions {
    file: string;
    output: string;
    abi: string;
    cairoPath: string;
    accountContract: boolean;
    disableHintValidation: boolean;
}
interface CairoToSierraOptions {
    path: string;
    output: string;
    binDirPath?: string;
    replaceIds?: boolean;
    allowedLibfuncsListName?: string;
    allowedLibfuncsListFile?: string;
}
interface SierraToCasmOptions {
    file: string;
    output: string;
    binDirPath?: string;
    allowedLibfuncsListName?: string;
    allowedLibfuncsListFile?: string;
    addPythonicHints?: boolean;
}
interface DeclareWrapperOptions {
    contract: string;
    maxFee: string;
    signature?: string[];
    token?: string;
    sender?: string;
    nonce?: string;
}
interface InteractWrapperOptions {
    maxFee: string;
    nonce: string;
    choice: InteractChoice;
    address: string;
    abi?: string;
    functionName: string;
    inputs?: string[];
    signature?: string[];
    wallet?: string;
    account?: string;
    accountDir?: string;
    blockNumber?: BlockNumber;
}
interface TxHashQueryWrapperOptions {
    hash: string;
}
interface DeployAccountWrapperOptions {
    wallet: string;
    accountName: string;
    accountDir: string;
    network: string;
}
interface NewAccountWrapperOptions {
    wallet: string;
    accountName: string;
    accountDir: string;
    network: string;
}
interface BlockQueryWrapperOptions {
    number?: BlockNumber;
    hash?: string;
}
interface NonceQueryWrapperOptions {
    address: string;
    blockHash?: string;
    blockNumber?: BlockNumber;
}
interface MigrateContractWrapperOptions {
    files: string[];
    inplace: boolean;
}
export declare abstract class StarknetWrapper {
    protected externalServer: ExternalServer;
    protected hre: HardhatRuntimeEnvironment;
    constructor(externalServer: ExternalServer, hre: HardhatRuntimeEnvironment);
    protected get gatewayUrl(): string;
    private get chainID();
    private get networkID();
    execute(command: "starknet" | "starknet-compile-deprecated" | "get_class_hash" | "cairo-migrate" | "get_contract_class" | "get_contract_class_hash" | "get_compiled_class_hash", args: string[]): Promise<ProcessResult>;
    protected prepareDeprecatedCompileOptions(options: CompileWrapperOptions): string[];
    deprecatedCompile(options: CompileWrapperOptions): Promise<ProcessResult>;
    abstract compileCairoToSierra(options: CairoToSierraOptions): Promise<ProcessResult>;
    abstract compileSierraToCasm(options: SierraToCasmOptions): Promise<ProcessResult>;
    prepareDeclareOptions(options: DeclareWrapperOptions): string[];
    declare(options: DeclareWrapperOptions): Promise<ProcessResult>;
    protected prepareCairoToSierraOptions(options: CairoToSierraOptions): string[];
    protected prepareSierraToCasmOptions(options: SierraToCasmOptions): string[];
    protected getCairo1Command(binDirPath: string, binCommand: string, args: string[]): string[];
    protected prepareInteractOptions(options: InteractWrapperOptions): string[];
    abstract interact(options: InteractWrapperOptions): Promise<ProcessResult>;
    protected prepareTxQueryOptions(command: string, options: TxHashQueryWrapperOptions): string[];
    getTxStatus(options: TxHashQueryWrapperOptions): Promise<ProcessResult>;
    getTransactionTrace(options: TxHashQueryWrapperOptions): Promise<ProcessResult>;
    protected prepareDeployAccountOptions(options: DeployAccountWrapperOptions): string[];
    deployAccount(options: DeployAccountWrapperOptions): Promise<ProcessResult>;
    protected prepareNewAccountOptions(options: NewAccountWrapperOptions): string[];
    newAccount(options: NewAccountWrapperOptions): Promise<ProcessResult>;
    getTransactionReceipt(options: TxHashQueryWrapperOptions): Promise<ProcessResult>;
    getTransaction(options: TxHashQueryWrapperOptions): Promise<ProcessResult>;
    protected prepareBlockQueryOptions(options: BlockQueryWrapperOptions): string[];
    getBlock(options: BlockQueryWrapperOptions): Promise<ProcessResult>;
    protected prepareNonceQueryOptions(options: NonceQueryWrapperOptions): string[];
    getNonce(options: NonceQueryWrapperOptions): Promise<ProcessResult>;
    getClassHash(artifactPath: string): Promise<string>;
    getCompiledClassHash(casmPath: string): Promise<string>;
    getSierraContractClassHash(casmPath: string): Promise<string>;
    migrateContract(options: MigrateContractWrapperOptions): Promise<ProcessResult>;
    estimateMessageFee(functionName: string, fromAddress: string, toAddress: string, inputs: string[]): Promise<FeeEstimation>;
}
export declare class DockerWrapper extends StarknetWrapper {
    private image;
    private rootPath;
    constructor(image: Image, rootPath: string, accountPaths: string[], cairoPaths: string[], hre: HardhatRuntimeEnvironment);
    compileCairoToSierra(options: CairoToSierraOptions): Promise<ProcessResult>;
    compileSierraToCasm(options: SierraToCasmOptions): Promise<ProcessResult>;
    interact(options: InteractWrapperOptions): Promise<ProcessResult>;
}
export declare class VenvWrapper extends StarknetWrapper {
    constructor(venvPath: string, hre: HardhatRuntimeEnvironment);
    protected get gatewayUrl(): string;
    compileCairoToSierra(options: CairoToSierraOptions): Promise<ProcessResult>;
    compileSierraToCasm(options: SierraToCasmOptions): Promise<ProcessResult>;
    interact(options: InteractWrapperOptions): Promise<ProcessResult>;
}
export {};
