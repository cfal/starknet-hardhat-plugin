import { HardhatRuntimeEnvironment, RunSuperFunction, TaskArguments } from "hardhat/types";
export declare function starknetCompileCairo1Action(args: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void>;
export declare function starknetDeprecatedCompileAction(args: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void>;
export declare function amarnaAction(args: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void>;
export declare function starknetVoyagerAction(args: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void>;
export declare function starknetNewAccountAction(args: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void>;
export declare function starknetDeployAccountAction(args: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void>;
export declare function starknetTestAction(args: TaskArguments, hre: HardhatRuntimeEnvironment, runSuper: RunSuperFunction<TaskArguments>): Promise<void>;
export declare function starknetRunAction(args: TaskArguments, hre: HardhatRuntimeEnvironment, runSuper: RunSuperFunction<TaskArguments>): Promise<void>;
export declare function starknetPluginVersionAction(): Promise<void>;
export declare function starknetMigrateAction(args: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void>;