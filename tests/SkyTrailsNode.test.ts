import { EnumerationProperty, NumberProperty } from "scenerystack/axon";
import { Bounds2 } from "scenerystack/dot";
import type { Path } from "scenerystack/scenery";
import { describe, expect, it } from "vitest";
import { SkyModel } from "../src/common/model/SkyModel.js";
import { ViewDirection } from "../src/common/model/ViewDirection.js";
import { equatorialToHorizonVector } from "../src/common/SkyCoordinates.js";
import { SkyProjection } from "../src/common/SkyProjection.js";
import { FirstPersonSkyViewNode } from "../src/common/view/FirstPersonSkyViewNode.js";
import { SkyTrailsNode } from "../src/common/view/SkyTrailsNode.js";
import { StringManager } from "../src/i18n/StringManager.js";

const makeModel = (): SkyModel =>
  new SkyModel({ defaultLatitudeProperty: new NumberProperty(40), defaultLongitudeProperty: new NumberProperty(0) });

const trailShapes = (node: SkyTrailsNode): string =>
  node.children.map((child) => (child as Path).shape?.getSVGPath()).join(" ");

describe("SkyTrailsNode", () => {
  const makeTrails = (model: SkyModel, maxLengthHours?: number): SkyTrailsNode =>
    new SkyTrailsNode(model, new SkyProjection(), {
      pathPointAt: (star, time) => ({
        point: equatorialToHorizonVector(star.raProperty.value, star.decProperty.value, 40, time),
        visible: true,
      }),
      redrawProperties: [model.siderealTimeProperty],
      ...(maxLengthHours === undefined ? {} : { maxLengthHoursProperty: new NumberProperty(maxLengthHours) }),
    });

  it.each([3, 24])("retains a %s-hour trail after complete rotations until reset", (length) => {
    const model = makeModel();
    model.addStar(0, 70);
    const node = makeTrails(model, length);
    model.advanceSiderealTime(24);
    const fullTrail = trailShapes(node);
    expect(fullTrail).toContain("L");
    model.advanceSiderealTime(24);
    expect(trailShapes(node)).toBe(fullTrail);
    model.resetStarTrails();
    expect(trailShapes(node).trim()).toBe("");
    node.dispose();
  });

  it("redraws existing and newly added stars after paused coordinate edits", () => {
    const model = makeModel();
    const star = model.addStar(0, 70);
    if (!star) {
      throw new Error("expected a star");
    }
    const node = makeTrails(model);
    model.advanceSiderealTime(3);
    const beforeRa = trailShapes(node);
    star.raProperty.value = 2;
    expect(trailShapes(node)).not.toBe(beforeRa);
    const beforeDec = trailShapes(node);
    star.decProperty.value = 50;
    expect(trailShapes(node)).not.toBe(beforeDec);
    const newStar = model.addStar(6, 10);
    if (!newStar) {
      throw new Error("expected a second star");
    }
    const beforeNewStarEdit = trailShapes(node);
    newStar.setEquatorial(7, 20);
    expect(trailShapes(node)).not.toBe(beforeNewStarEdit);
    model.removeStar(star);
    node.dispose();
    // A disposed trail must release its property/collection subscriptions.
    expect(() => {
      newStar.setEquatorial(8, 30);
      model.removeAllStars();
      model.advanceSiderealTime(1);
    }).not.toThrow();
  });
});

describe("first-person trails", () => {
  it("retains full-day trails and updates them when a star moves while paused", () => {
    const model = makeModel();
    const star = model.addStar(0, 70);
    if (!star) {
      throw new Error("expected a star");
    }
    const node = new FirstPersonSkyViewNode(model, {
      bounds: new Bounds2(0, 0, 300, 300),
      viewDirectionProperty: new EnumerationProperty(ViewDirection.NORTH),
      directionLabelProperty: StringManager.getInstance().getControls().viewDirectionNorthStringProperty,
    });
    const shapes = (): string =>
      node.children
        .slice(5, 17)
        .map((child) => (child as Path).shape?.getSVGPath())
        .join(" ");
    model.advanceSiderealTime(24);
    expect(shapes()).toContain("L");
    const before = shapes();
    star.decProperty.value = 80;
    expect(shapes()).not.toBe(before);
    model.advanceSiderealTime(24);
    expect(shapes()).toContain("L");
    model.resetStarTrails();
    expect(shapes().trim()).toBe("");
  });
});
