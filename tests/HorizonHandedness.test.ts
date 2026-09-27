/**
 * HorizonHandedness.test.ts — the horizon frame (+X north, +Y east, +Z zenith)
 * is left-handed; without HORIZON_FRAME_MATRIX the dome was drawn as a mirror
 * image (north on the wrong side of an observer facing east).
 */
import { Vector3 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import { HORIZON_FRAME_MATRIX, SkyProjection } from "../src/common/SkyProjection.js";

const NORTH = new Vector3(1, 0, 0);
const EAST = new Vector3(0, 1, 0);
const SOUTH = new Vector3(-1, 0, 0);

/** Twice the signed area of a screen triangle (screen y grows downward). */
const signedArea2 = (projection: SkyProjection): number => {
  const [a, b, c] = [NORTH, EAST, SOUTH].map((v) => projection.project(v));
  if (a === undefined || b === undefined || c === undefined) {
    throw new Error("projection failed");
  }
  return a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y);
};

describe("horizon dome handedness", () => {
  it("draws N → E → S clockwise when seen from above (a map, not its mirror)", () => {
    for (const azimuth of [0, 1, 2, 3, 4, 5]) {
      const projection = new SkyProjection({ azimuth, elevation: -0.6, frameMatrix: HORIZON_FRAME_MATRIX });
      expect(signedArea2(projection)).toBeGreaterThan(0);
    }
  });

  it("the identity frame would mirror it", () => {
    const projection = new SkyProjection({ azimuth: 0, elevation: -0.6 });
    expect(signedArea2(projection)).toBeLessThan(0);
  });
});
