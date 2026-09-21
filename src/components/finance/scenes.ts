/**
 * Scenes for the finance module walkthroughs. Same contract as the explorer
 * debriefs (`@/components/diagram/graph`), plus a few running numbers per step
 * so the meter strip under the diagram can show money leaking or piling up.
 *
 * The numbers are one illustrative example carried through each walkthrough,
 * not market data. No user-visible text lives here.
 */

import type { GraphStep, Scene } from "@/components/diagram/graph";

export interface MeterDef {
  /** Label and unit come from `<namespace>.diagram.meters.<id>`. */
  id: string;
  /** `ratio` renders two decimals and skips the rolling counter. */
  format?: "amount" | "ratio";
  tone: "fiat" | "chain" | "warning" | "success";
  /** Ratio meters turn amber below `warnBelow` and red below `dangerBelow`. */
  warnBelow?: number;
  dangerBelow?: number;
}

export interface FlowStep extends GraphStep {
  /** Meter id → value at the end of this step. Missing means "not relevant". */
  values: Record<string, number>;
}

export interface FlowScene extends Scene {
  meters: MeterDef[];
  steps: FlowStep[];
}

/* ── remittance, the bank way ────────────────────────────────────────────── */

/**
 * 500 USD sent by wire from the US to a family in Vietnam. Fees add up to 7 %,
 * between the World Bank's global average for remittances (about 6.5 %) and
 * its average for banks (about 9.5 %).
 */
export const WIRE_SCENE: FlowScene = {
  nodes: [
    { id: "sender", x: 80, y: 235, icon: "person", tone: "fiat" },
    { id: "bankA", x: 250, y: 235, icon: "bank", tone: "fiat" },
    { id: "corr", x: 440, y: 235, icon: "bank", tone: "fiat" },
    { id: "bankB", x: 630, y: 235, icon: "bank", tone: "fiat" },
    { id: "family", x: 800, y: 235, icon: "family", tone: "fiat" },
    { id: "swift", x: 440, y: 62, icon: "network", tone: "brand" },
    { id: "fees", x: 440, y: 405, icon: "fees", tone: "warning" },
  ],
  edges: [
    { id: "deposit", from: "sender", to: "bankA", curve: -26, tone: "fiat" },
    { id: "msgA", from: "bankA", to: "swift", curve: 0, tone: "brand", labelOffset: { x: -44, y: 0 } },
    { id: "msgCorr", from: "swift", to: "corr", curve: 0, tone: "brand", labelAt: 0.4, labelOffset: { x: 40, y: 0 } },
    { id: "msgB", from: "swift", to: "bankB", curve: 0, tone: "brand", labelOffset: { x: 46, y: 0 } },
    { id: "hop1", from: "bankA", to: "corr", curve: -26, tone: "fiat" },
    { id: "hop2", from: "corr", to: "bankB", curve: -26, tone: "fiat" },
    { id: "payout", from: "bankB", to: "family", curve: -26, tone: "fiat" },
    { id: "feeA", from: "bankA", to: "fees", curve: 0, tone: "warning", labelOffset: { x: -30, y: 0 } },
    { id: "feeCorr", from: "corr", to: "fees", curve: 0, tone: "warning", labelOffset: { x: 34, y: 0 } },
    { id: "feeB", from: "bankB", to: "fees", curve: 0, tone: "warning", labelOffset: { x: 34, y: 0 } },
  ],
  meters: [
    { id: "amount", tone: "fiat" },
    { id: "fees", tone: "warning" },
  ],
  steps: [
    { id: "send", highlight: ["sender", "bankA"], active: ["deposit"], values: { amount: 500, fees: 0 } },
    {
      id: "message",
      highlight: ["bankA", "swift", "fees"],
      active: ["msgA", "feeA"],
      values: { amount: 485, fees: 15 },
    },
    {
      id: "correspondent",
      highlight: ["bankA", "corr", "swift", "fees"],
      active: ["hop1", "msgCorr", "feeCorr"],
      values: { amount: 475, fees: 25 },
    },
    {
      id: "arrive",
      highlight: ["corr", "bankB", "swift", "fees"],
      active: ["hop2", "msgB", "feeB"],
      values: { amount: 465, fees: 35 },
    },
    { id: "payout", highlight: ["bankB", "family"], active: ["payout"], values: { amount: 465, fees: 35 } },
    {
      id: "problems",
      highlight: ["bankA", "corr", "bankB", "fees"],
      active: ["feeA", "feeCorr", "feeB"],
      values: { amount: 465, fees: 35 },
    },
  ],
};

/* ── remittance, MoneyGram on Stellar ────────────────────────────────────── */

/**
 * The same 500 USD through MoneyGram's cash ramps: cash in as USDC, one
 * Stellar payment, cash out on the other side. Fees are illustrative; the
 * network fee itself is a fraction of a cent and rounds to zero here.
 */
export const MONEYGRAM_SCENE: FlowScene = {
  nodes: [
    { id: "sender", x: 80, y: 235, icon: "person", tone: "fiat" },
    { id: "mgA", x: 250, y: 235, icon: "anchor", tone: "brand" },
    { id: "stellar", x: 440, y: 235, icon: "ledger", tone: "chain" },
    { id: "mgB", x: 630, y: 235, icon: "anchor", tone: "brand" },
    { id: "family", x: 800, y: 235, icon: "family", tone: "fiat" },
    { id: "circle", x: 440, y: 62, icon: "stablecoin", tone: "chain" },
    { id: "walletA", x: 250, y: 405, icon: "wallet", tone: "chain" },
    { id: "walletB", x: 630, y: 405, icon: "wallet", tone: "chain" },
  ],
  edges: [
    { id: "cashIn", from: "sender", to: "mgA", curve: -26, tone: "fiat" },
    { id: "usdc", from: "circle", to: "mgA", curve: -24, tone: "chain" },
    { id: "toWallet", from: "mgA", to: "walletA", curve: 0, tone: "chain", labelOffset: { x: -52, y: 0 } },
    { id: "sign", from: "walletA", to: "stellar", curve: 0, tone: "chain", labelOffset: { x: -36, y: 0 } },
    { id: "settle", from: "stellar", to: "walletB", curve: 0, tone: "chain", labelOffset: { x: 40, y: 0 } },
    { id: "toAnchor", from: "walletB", to: "mgB", curve: 0, tone: "chain", labelOffset: { x: 52, y: 0 } },
    { id: "redeem", from: "mgB", to: "circle", curve: -24, tone: "chain" },
    { id: "cashOut", from: "mgB", to: "family", curve: -26, tone: "fiat" },
  ],
  meters: [
    { id: "amount", tone: "chain" },
    { id: "fees", tone: "warning" },
  ],
  steps: [
    { id: "cashIn", highlight: ["sender", "mgA"], active: ["cashIn"], values: { amount: 500, fees: 0 } },
    {
      id: "usdc",
      highlight: ["circle", "mgA", "walletA"],
      active: ["usdc", "toWallet"],
      values: { amount: 495, fees: 5 },
    },
    { id: "sign", highlight: ["walletA", "stellar"], active: ["sign"], values: { amount: 495, fees: 5 } },
    {
      id: "settle",
      highlight: ["stellar", "walletB"],
      active: ["settle"],
      values: { amount: 495, fees: 5 },
    },
    {
      id: "cashOut",
      highlight: ["walletB", "mgB", "family", "circle"],
      active: ["toAnchor", "cashOut", "redeem"],
      values: { amount: 488, fees: 12 },
    },
    {
      id: "compare",
      highlight: ["sender", "mgA", "stellar", "mgB", "family"],
      active: ["cashIn", "sign", "settle", "cashOut"],
      values: { amount: 488, fees: 12 },
    },
  ],
};

/* ── a secured loan at a Vietnamese bank ─────────────────────────────────── */

/**
 * A 500 million VND loan against a house worth 1 billion. The meter tracks
 * the loan against the collateral the bank holds.
 */
export const BANK_LOAN_SCENE: FlowScene = {
  nodes: [
    { id: "savers", x: 90, y: 110, icon: "family", tone: "fiat" },
    { id: "bank", x: 440, y: 110, icon: "bank", tone: "fiat" },
    { id: "borrower", x: 790, y: 110, icon: "person", tone: "fiat" },
    { id: "cic", x: 250, y: 385, icon: "bureau", tone: "brand" },
    { id: "house", x: 630, y: 385, icon: "house", tone: "warning" },
  ],
  edges: [
    { id: "deposit", from: "savers", to: "bank", curve: -30, tone: "fiat" },
    { id: "interest", from: "bank", to: "savers", curve: -30, tone: "success" },
    { id: "apply", from: "borrower", to: "bank", curve: -30, tone: "fiat" },
    { id: "check", from: "bank", to: "cic", curve: 0, tone: "brand", labelOffset: { x: -40, y: 0 } },
    { id: "pledge", from: "borrower", to: "house", curve: 0, tone: "warning", labelOffset: { x: 46, y: 0 } },
    { id: "appraise", from: "bank", to: "house", curve: 0, tone: "warning", labelOffset: { x: 42, y: 0 } },
    { id: "disburse", from: "bank", to: "borrower", curve: -30, tone: "fiat" },
    { id: "repay", from: "borrower", to: "bank", curve: -30, tone: "success" },
    { id: "seize", from: "house", to: "bank", curve: 34, tone: "warning", labelAt: 0.45 },
  ],
  meters: [
    { id: "loan", tone: "fiat" },
    { id: "collateral", tone: "warning" },
  ],
  steps: [
    { id: "deposits", highlight: ["savers", "bank"], active: ["deposit"], values: { loan: 0, collateral: 0 } },
    {
      id: "apply",
      highlight: ["borrower", "bank", "cic"],
      active: ["apply", "check"],
      values: { loan: 0, collateral: 0 },
    },
    {
      id: "collateral",
      highlight: ["borrower", "bank", "house"],
      active: ["pledge", "appraise"],
      values: { loan: 0, collateral: 1000 },
    },
    {
      id: "disburse",
      highlight: ["bank", "borrower"],
      active: ["disburse"],
      values: { loan: 500, collateral: 1000 },
    },
    {
      id: "repay",
      highlight: ["borrower", "bank", "savers"],
      active: ["repay", "interest"],
      values: { loan: 500, collateral: 1000 },
    },
    {
      id: "default",
      highlight: ["bank", "house", "cic"],
      active: ["seize", "check"],
      values: { loan: 500, collateral: 1000 },
    },
  ],
};

/* ── a Blend lending pool ────────────────────────────────────────────────── */

/**
 * One borrower in a USDC / XLM pool: 1,000 USD of XLM as collateral, 500 USDC
 * borrowed, collateral factor 75 %. Health = collateral × 0.75 ÷ debt; below
 * 1.00 the position can be liquidated.
 */
export const BLEND_SCENE: FlowScene = {
  nodes: [
    { id: "lenders", x: 90, y: 110, icon: "family", tone: "chain" },
    { id: "pool", x: 440, y: 110, icon: "pool", tone: "chain" },
    { id: "borrower", x: 790, y: 110, icon: "person", tone: "chain" },
    { id: "backstop", x: 170, y: 385, icon: "backstop", tone: "success" },
    { id: "oracle", x: 440, y: 385, icon: "oracle", tone: "brand" },
    { id: "liquidator", x: 710, y: 385, icon: "liquidator", tone: "warning" },
  ],
  edges: [
    { id: "supply", from: "lenders", to: "pool", curve: -30, tone: "chain" },
    { id: "yield", from: "pool", to: "lenders", curve: -30, tone: "success" },
    { id: "collateral", from: "borrower", to: "pool", curve: -30, tone: "chain" },
    { id: "borrow", from: "pool", to: "borrower", curve: -30, tone: "chain" },
    { id: "repay", from: "borrower", to: "pool", curve: -30, tone: "success" },
    { id: "price", from: "oracle", to: "pool", curve: 0, tone: "brand", labelOffset: { x: 40, y: 0 } },
    { id: "cover", from: "pool", to: "backstop", curve: 0, tone: "success", labelOffset: { x: -44, y: 0 } },
    { id: "rescue", from: "backstop", to: "pool", curve: 70, tone: "success", labelAt: 0.55, labelOffset: { x: 40, y: 0 } },
    { id: "liquidate", from: "liquidator", to: "pool", curve: 0, tone: "warning", labelOffset: { x: 78, y: 0 } },
    { id: "seize", from: "pool", to: "liquidator", curve: 70, tone: "warning", labelAt: 0.55, labelOffset: { x: -56, y: 0 } },
  ],
  meters: [
    { id: "collateral", tone: "chain" },
    { id: "debt", tone: "warning" },
    { id: "health", format: "ratio", tone: "success", warnBelow: 1.2, dangerBelow: 1 },
  ],
  steps: [
    { id: "supply", highlight: ["lenders", "pool"], active: ["supply"], values: { collateral: 0, debt: 0 } },
    {
      id: "collateral",
      highlight: ["borrower", "pool", "oracle"],
      active: ["collateral", "price"],
      values: { collateral: 1000, debt: 0 },
    },
    {
      id: "borrow",
      highlight: ["pool", "borrower"],
      active: ["borrow"],
      values: { collateral: 1000, debt: 500, health: 1.5 },
    },
    {
      id: "interest",
      highlight: ["pool", "lenders", "backstop"],
      active: ["yield", "cover"],
      values: { collateral: 1000, debt: 510, health: 1.47 },
    },
    {
      id: "repay",
      highlight: ["borrower", "pool"],
      active: ["repay"],
      values: { collateral: 1000, debt: 0 },
    },
    {
      id: "price",
      highlight: ["oracle", "pool", "borrower"],
      active: ["price"],
      values: { collateral: 650, debt: 510, health: 0.96 },
    },
    {
      id: "liquidate",
      highlight: ["liquidator", "pool", "borrower"],
      active: ["liquidate", "seize"],
      values: { collateral: 310, debt: 200, health: 1.16 },
    },
    {
      id: "backstop",
      highlight: ["backstop", "pool", "lenders"],
      active: ["rescue"],
      values: { collateral: 310, debt: 200, health: 1.16 },
    },
  ],
};
