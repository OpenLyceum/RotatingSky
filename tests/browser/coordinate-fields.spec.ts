import { expect, test } from "@playwright/test";
import type { Vector2 } from "scenerystack/dot";
import type { Node } from "scenerystack/scenery";
import type { SkyModel } from "../../src/common/model/SkyModel.js";

type SimulationWindow = Window & {
  phet: {
    joist: {
      sim: {
        selectedScreenProperty: { value: { model: { sky: SkyModel }; view: Node } };
      };
    };
  };
};

test("coordinate fields accept pointer and keyboard edits and disable without a star", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?initialScreen=3&ea");
  const raField = page.getByRole("textbox", { name: "right ascension", exact: true });
  await expect(raField).toBeAttached();
  await page.evaluate(() => {
    (window as unknown as SimulationWindow).phet.joist.sim.selectedScreenProperty.value.model.sky.addStar(2, 30);
  });

  const point = await page.evaluate(() => {
    const view = (window as unknown as SimulationWindow).phet.joist.sim.selectedScreenProperty.value.view;
    const readout = view.children.find((node) => node.constructor.name === "SkyReadoutNode");
    const input = readout?.children[0]?.children[1];
    if (!input) {
      throw new Error("expected the equatorial coordinate input");
    }
    const center: Vector2 = input.localToGlobalPoint(input.localBounds.center);
    return { x: center.x, y: center.y };
  });
  await page.mouse.click(point.x, point.y);
  await expect(raField).toBeFocused();
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("Backspace");
  }
  await page.keyboard.type("3");
  await page.keyboard.press("Enter");
  await expect(raField).toHaveText("3.0");
  expect(
    await page.evaluate(
      () =>
        (window as unknown as SimulationWindow).phet.joist.sim.selectedScreenProperty.value.model.sky
          .selectedStarProperty.value?.raProperty.value,
    ),
  ).toBe(3);

  // Leaving an uncommitted edit must restore the model value and allow live updates.
  await page.keyboard.type("9");
  await page.keyboard.press("Tab");
  await expect(raField).toHaveText("3.0");

  const decField = page.getByRole("textbox", { name: "declination", exact: true });
  await decField.focus();
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press("Backspace");
  }
  await page.keyboard.type("-20");
  await page.keyboard.press("Enter");
  await expect(decField).toHaveText("-20.0");
  expect(
    await page.evaluate(
      () =>
        (window as unknown as SimulationWindow).phet.joist.sim.selectedScreenProperty.value.model.sky
          .selectedStarProperty.value?.decProperty.value,
    ),
  ).toBe(-20);

  await page.evaluate(() => {
    (window as unknown as SimulationWindow).phet.joist.sim.selectedScreenProperty.value.model.sky.removeAllStars();
  });
  await expect(raField).toBeDisabled();
  expect(await raField.evaluate((element) => (element as HTMLElement).tabIndex)).toBe(-1);
  expect(errors).toEqual([]);
});
