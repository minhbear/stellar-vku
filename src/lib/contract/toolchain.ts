/**
 * Versions and links for module 5. They live here, not in the message files,
 * because they change with each Stellar CLI release while the copy does not.
 *
 * `SOROBAN_SDK_MAJOR` must match what `stellar contract init` writes into the
 * workspace `Cargo.toml` for `STELLAR_CLI_VERSION`. Check
 * `cmd/soroban-cli/src/utils/contract-workspace-template/Cargo.toml.removeextension`
 * in the stellar-cli repo at that tag before bumping either one.
 */
export const STELLAR_CLI_VERSION = "30.0.1";
export const SOROBAN_SDK_MAJOR = "29";
export const MIN_RUST_VERSION = "1.84.0";

/** `stellar contract init` names the first contract `hello-world`. */
export const CONTRACT_DIR = "contracts\\hello-world";
export const WASM_PATH = "target\\wasm32v1-none\\release\\hello_world.wasm";

/** Identity and alias used in every command so students can copy them as-is. */
export const IDENTITY = "student";
export const CONTRACT_ALIAS = "my-contract";

export const LINKS = {
  github: "https://github.com/signup",
  githubDesktop: "https://desktop.github.com/download/",
  vsBuildTools: "https://visualstudio.microsoft.com/visual-cpp-build-tools/",
  rustup: "https://rustup.rs/",
  stellarCliRelease: `https://github.com/stellar/stellar-cli/releases/tag/v${STELLAR_CLI_VERSION}`,
  stellarCliInstaller: `https://github.com/stellar/stellar-cli/releases/download/v${STELLAR_CLI_VERSION}/stellar-cli-installer-${STELLAR_CLI_VERSION}-x86_64-pc-windows-msvc.exe`,
  windowsTerminal: "https://aka.ms/terminal",
  vscode: "https://code.visualstudio.com/",
  rustAnalyzer: "https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer",
  expertContract: "https://stellar.expert/explorer/testnet/contract/",
  exampleRepo: "https://github.com/rajnandaniy563-droid/ChainSubscription-Hub",
  sorobanExamples: "https://github.com/stellar/soroban-examples",
} as const;

/** Commands shown in the lessons. Never translated: students paste them. */
export const COMMANDS = {
  makeFolder: "mkdir C:\\stellar\ncd C:\\stellar",
  wingetRust: "winget install --id Rustlang.Rustup -e",
  wingetBuildTools:
    'winget install --id Microsoft.VisualStudio.BuildTools -e --override "--passive --wait --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"',
  wingetStellar: "winget install --id Stellar.StellarCLI -e",
  wingetGithubDesktop: "winget install --id GitHub.GitHubDesktop -e",
  rustTarget: "rustup target add wasm32v1-none",
  rustUpdate: "rustup update stable\nrustup target add wasm32v1-none",
  rustMsvc: "rustup default stable-x86_64-pc-windows-msvc\nrustup target add wasm32v1-none",
  executionPolicy: "Set-ExecutionPolicy -Scope CurrentUser RemoteSigned",
  checkVersions: "rustc --version\ncargo --version\nstellar --version",
  init: (project: string) => `cd C:\\stellar\nstellar contract init ${project}\ncd ${project}`,
  openCode: "code .",
  deleteTest: `del ${CONTRACT_DIR}\\src\\test.rs`,
  checkSdk: "type Cargo.toml",
  build: "stellar contract build",
  test: "cargo test",
  keys: `stellar keys generate ${IDENTITY} --network testnet --fund\nstellar keys address ${IDENTITY}`,
  fund: `stellar keys fund ${IDENTITY} --network testnet`,
  deploy: `stellar contract deploy --wasm ${WASM_PATH} --source-account ${IDENTITY} --network testnet --alias ${CONTRACT_ALIAS}`,
  help: `stellar contract invoke --id ${CONTRACT_ALIAS} --source-account ${IDENTITY} --network testnet -- --help`,
  invokeWrite: `stellar contract invoke --id ${CONTRACT_ALIAS} --source-account ${IDENTITY} --network testnet -- create_goal --owner ${IDENTITY} --name "Laptop" --target 1000`,
  invokeRead: `stellar contract invoke --id ${CONTRACT_ALIAS} --source-account ${IDENTITY} --network testnet -- get_goal --owner ${IDENTITY}`,
  contractId: `stellar contract alias show ${CONTRACT_ALIAS} --network testnet`,
} as const;
