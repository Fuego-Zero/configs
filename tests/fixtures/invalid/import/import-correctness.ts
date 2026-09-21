import extra from "././default-export.js";
import { flagged } from "./import-correctness.js";

export const flagged = 1;

export function useImported() {
  return `${String(extra)}:${flagged}`;
}
