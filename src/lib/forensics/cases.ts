/**
 * The two explorer cases: what students are given, and what counts as a
 * correct answer.
 *
 * Every address, amount and hash comes from `case-data.json`, which
 * `scripts/seed-forensics.ts` regenerates against the live testnet — SDF wipes
 * testnet every few months, so nothing here may be hard-coded and no lesson
 * copy may name an address. Message files hold the questions, this file holds
 * the answers.
 */
import data from "./case-data.json";
import { stellarConfig } from "@/lib/stellar/config";

export const caseData = data;
export const case1 = data.case1;
export const case2 = data.case2;
export const case3 = data.case3;

export type AnswerKind = "address" | "number" | "text" | "choice";

export interface CaseQuestion {
  id: string;
  kind: AnswerKind;
  /** Canonical answer — this is also what the reveal button shows. */
  answer: string;
  /** Other spellings a student may reasonably type. */
  alsoAccept?: string[];
  /** `choice` only — how many options `questions.<id>.options` defines. */
  optionCount?: number;
  /** ICU values for the prompt and explanation, e.g. the asset code. */
  vars?: Record<string, string>;
  /** The explorer page where the answer is visible — never the answer itself. */
  link?: string;
  /** Harder than the rest; solvable but not required to follow the debrief. */
  bonus?: boolean;
}

export interface CaseDef {
  id: "case1" | "case2" | "case3";
  /** The one piece of evidence the student starts from. */
  evidence: { kind: "account" | "contract"; value: string };
  questions: CaseQuestion[];
}

const explorer = stellarConfig.explorer;

const subject = case1.subject;
/** Mission 1 is one wallet: every question is answered on its account page. */
const subjectPage = explorer.account(subject);
const airAsset = explorer.asset(case2.code, case2.issuer);

export const CASE_1: CaseDef = {
  id: "case1",
  evidence: { kind: "account", value: subject },
  questions: [
    {
      id: "creator",
      kind: "address",
      answer: case1.creator,
      link: subjectPage,
    },
    {
      id: "holdings",
      kind: "number",
      answer: String(case1.trustlineCount),
      link: subjectPage,
    },
    {
      id: "issuer",
      kind: "address",
      answer: case1.holdings[0].issuer,
      alsoAccept: [`${case1.holdings[0].code}-${case1.holdings[0].issuer}`],
      vars: { code: case1.holdings[0].code },
      link: subjectPage,
    },
    {
      id: "balance",
      kind: "number",
      answer: case1.holdings[0].balance,
      vars: { code: case1.holdings[0].code },
      link: subjectPage,
    },
    {
      id: "spendTo",
      kind: "address",
      answer: case1.spend.destination,
      vars: { code: case1.spend.code },
      link: subjectPage,
    },
    {
      id: "homeDomain",
      kind: "text",
      answer: case1.homeDomain,
      link: subjectPage,
    },
  ],
};

const biggest = [...case2.recipients].sort(
  (a, b) => Number(b.amount) - Number(a.amount),
)[0];

export const CASE_2: CaseDef = {
  id: "case2",
  evidence: { kind: "contract", value: case2.contractId },
  questions: [
    {
      id: "issuer",
      kind: "address",
      answer: case2.issuer,
      alsoAccept: [`${case2.code}-${case2.issuer}`],
      link: explorer.contract(case2.contractId),
    },
    {
      id: "supply",
      kind: "number",
      answer: case2.supply,
      link: airAsset,
    },
    {
      id: "treasury",
      kind: "address",
      answer: case2.treasury,
      link: explorer.account(case2.issuer),
    },
    {
      id: "recipients",
      kind: "number",
      answer: String(case2.recipients.length),
      link: explorer.account(case2.treasury),
    },
    {
      id: "whale",
      kind: "address",
      answer: biggest.address,
      link: explorer.account(case2.treasury),
    },
    {
      // The holder list is one wallet longer than the airdrop list — the extra
      // one is the answer, so the asset page is the place to start.
      id: "forward",
      kind: "address",
      answer: case2.forward.to,
      link: airAsset,
    },
    {
      id: "mintMore",
      kind: "choice",
      answer: "1",
      optionCount: 3,
      link: airAsset,
    },
    {
      // No link: finding which recipient holds two same-code tokens is the work.
      id: "lookalike",
      kind: "address",
      answer: case2.decoy.issuer,
      bonus: true,
    },
  ],
};

const case3Subject = explorer.account(case3.subject);
const vndAsset = explorer.asset(case3.code, case3.issuer);
const case3Issuer = explorer.account(case3.issuer);

/** Biggest customer balance, ignoring the distributor. */
const topCustomer = [...case3.customers].sort(
  (a, b) => Number(b.balance) - Number(a.balance),
)[0];

export const CASE_3: CaseDef = {
  id: "case3",
  evidence: { kind: "account", value: case3.subject },
  questions: [
    {
      id: "issuer",
      kind: "address",
      answer: case3.issuer,
      alsoAccept: [`${case3.code}-${case3.issuer}`],
      link: case3Subject,
    },
    {
      id: "frozen",
      kind: "choice",
      answer: "1",
      optionCount: 3,
      link: case3Subject,
    },
    {
      id: "payer",
      kind: "address",
      answer: case3.treasury,
      link: case3Subject,
    },
    {
      id: "supply",
      kind: "number",
      answer: case3.supply,
      // The explorer counts the frozen line too; a student reading only the
      // authorised total should not be marked wrong for it.
      alsoAccept: [case3.supplyAuthorized],
      link: vndAsset,
    },
    {
      id: "mintMore",
      kind: "choice",
      answer: "1",
      optionCount: 3,
      link: vndAsset,
    },
    {
      id: "clawback",
      kind: "address",
      answer: case3.clawback.address,
      link: case3Issuer,
    },
    {
      id: "burn",
      kind: "number",
      answer: case3.burn.amount,
      link: case3Issuer,
    },
    {
      id: "topHolder",
      kind: "address",
      answer: topCustomer.address,
      bonus: true,
      link: vndAsset,
    },
  ],
};

/**
 * Answers are compared after normalising, not literally: addresses are
 * case-folded, and `1,000,000` / `1000000.0000000` / `1000000` are the same
 * number — the explorer prints the same amount differently on different pages.
 */
export function normaliseAnswer(kind: AnswerKind, raw: string): string {
  const value = raw.trim();
  switch (kind) {
    case "address":
      return value.replace(/\s+/g, "").toUpperCase();
    case "number": {
      const digits = value.replace(/[\s,_]/g, "");
      if (!/^\d+(\.\d+)?$/.test(digits)) return digits.toLowerCase();
      const [whole, fraction = ""] = digits.split(".");
      const trimmed = fraction.replace(/0+$/, "");
      const clean = whole.replace(/^0+(?=\d)/, "");
      return trimmed ? `${clean}.${trimmed}` : clean;
    }
    case "text":
      return value.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
    case "choice":
      return value;
  }
}

export function isCorrect(question: CaseQuestion, raw: string): boolean {
  if (!raw.trim()) return false;
  const given = normaliseAnswer(question.kind, raw);
  return [question.answer, ...(question.alsoAccept ?? [])].some(
    (accepted) => normaliseAnswer(question.kind, accepted) === given,
  );
}
