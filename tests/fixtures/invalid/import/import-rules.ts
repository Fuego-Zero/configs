const ready = true;

import { item10, alpha, item2 } from "../../valid/ts/exports.js";
import path from "node:path";
import { useEffect } from "react";
import { useState } from "react";
import { User } from "../../valid/ts/models.js";
export function useReady(): User | typeof ready {
  useEffect(() => undefined, []);
  useState(ready);

  return ready;
}

export { path, item10, alpha, item2 };
