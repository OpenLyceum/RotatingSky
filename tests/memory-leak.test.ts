/**
 * Memory-leak regression suite (fleet standard): each screen model is collected after
 * dispose(), survives a double dispose(), and leaves no survivors across repeated cycles
 * (tests/helpers/memoryLeak.ts). Add sim-specific leak tests below using forceGC().
 */

import { SkyProjection } from "../src/common/SkyProjection.js";
import { TimeModel } from "../src/common/TimeModel.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

describeDisposalLeaks([
  { name: "SkyProjection", create: () => new SkyProjection() },
  { name: "TimeModel", create: () => new TimeModel(), idempotentDispose: true },
]);
