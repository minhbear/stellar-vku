import { IDENTITY } from "@/lib/contract/toolchain";

/**
 * The README layout every EC project hands in. Headings stay in English on
 * both locales: they are the format reviewers look for, not site copy.
 */
export const README_TEMPLATE = `# <Project name>

## Project Title
<Project name>

## Project Description
<What the contract does, in 3 to 5 sentences.>

## Project Vision
<The bigger goal: who it helps and what changes for them.>

## Key Features
- **<Feature>:** <what it does and who can call it>
- **<Feature>:** <...>

## Usage Instructions
1. <First function to call and why>
2. <...>

## Future Scope
- <What you would add next>

## Technology Stack
- Rust and soroban-sdk
- Stellar testnet
- Stellar CLI

## Contract Detail
Contract ID: <C... from stellar contract deploy>
Deployer: <G... from stellar keys address ${IDENTITY}>
![Contract on Stellar Expert](image.png)
`;
