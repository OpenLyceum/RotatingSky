/**
 * EditableNumberFieldNode.ts
 *
 * A compact label + white numeric field + unit row, matching the original NAAP
 * coordinate inputs beneath each sky view. Click or focus the field, type a
 * number, and press Enter to commit.
 */

import { PatternStringProperty, type ReadOnlyProperty, StringProperty } from "scenerystack/axon";
import { toFixed } from "scenerystack/dot";
import type { SceneryEvent } from "scenerystack/scenery";
import { HBox, Node, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";
import RotatingSkyColors from "../../RotatingSkyColors.js";
import { CONTROL_FONT_SIZE } from "../../RotatingSkyConstants.js";

const FIELD_WIDTH = 52;
const FIELD_HEIGHT = 18;

export type EditableNumberFieldNodeOptions = {
  labelProperty: ReadOnlyProperty<string>;
  unit: string;
  decimalPlaces: number;
  onCommit: (value: number) => void;
};

const parseNumber = (text: string): number | null => {
  const trimmed = text.trim();
  if (trimmed === "" || trimmed === "-" || trimmed === ".") {
    return null;
  }
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
};

export class EditableNumberFieldNode extends HBox {
  private editing = false;
  private editBuffer = "";
  private fieldActive = true;
  private readonly decimalPlaces: number;
  private readonly onCommit: (value: number) => void;
  private readonly valueStringProperty: StringProperty;
  private readonly fieldBackground: Rectangle;
  private readonly fieldNode: Node;

  public constructor(options: EditableNumberFieldNodeOptions) {
    const { labelProperty, unit, decimalPlaces, onCommit } = options;

    const controls = StringManager.getInstance().getControls();
    const labelStringProperty = new PatternStringProperty(controls.fieldLabelPatternStringProperty, {
      label: labelProperty,
    });
    const label = new Text(labelStringProperty, {
      font: new PhetFont(CONTROL_FONT_SIZE),
      fill: RotatingSkyColors.textColorProperty,
    });

    const fieldBackground = new Rectangle(0, 0, FIELD_WIDTH, FIELD_HEIGHT, {
      fill: RotatingSkyColors.controlSurfaceColorProperty,
      stroke: RotatingSkyColors.gridColorProperty,
      lineWidth: 1,
      cornerRadius: 2,
    });
    const valueStringProperty = new StringProperty(controls.unknownValueStringProperty.value);
    const valueText = new Text(valueStringProperty, {
      font: new PhetFont(CONTROL_FONT_SIZE),
      fill: RotatingSkyColors.controlSurfaceTextColorProperty,
    });
    const fieldNode = new Node({
      children: [fieldBackground, valueText],
      focusable: true,
      cursor: "text",
    });
    valueText.centerX = fieldBackground.centerX;
    valueText.centerY = fieldBackground.centerY;

    const unitText = new Text(new StringProperty(unit), {
      font: new PhetFont(CONTROL_FONT_SIZE),
      fill: RotatingSkyColors.textColorProperty,
    });

    super({
      spacing: 4,
      align: "center",
      children: [label, fieldNode, unitText],
    });

    this.decimalPlaces = decimalPlaces;
    this.onCommit = onCommit;
    this.valueStringProperty = valueStringProperty;
    this.disposeEmitter.addListener(() => labelStringProperty.dispose());
    this.fieldBackground = fieldBackground;
    this.fieldNode = fieldNode;

    fieldNode.addInputListener({
      down: () => {
        if (this.fieldActive) {
          this.beginEditing();
        }
      },
      keydown: (event) => this.handleKeyDown(event),
    });
  }

  /** Updates the displayed value when the model changes. Ignored while the user is editing. */
  public setDisplayValue(value: number | null): void {
    if (this.editing) {
      return;
    }
    this.editBuffer = value === null ? "" : toFixed(value, this.decimalPlaces);
    this.updateValueText();
  }

  public setFieldEnabled(enabled: boolean): void {
    this.fieldActive = enabled;
    this.fieldBackground.fill = enabled
      ? RotatingSkyColors.controlSurfaceColorProperty
      : RotatingSkyColors.controlSurfaceDisabledColorProperty;
    this.fieldNode.cursor = enabled ? "text" : "default";
    if (!enabled) {
      this.editing = false;
      this.editBuffer = "";
      this.showUnknownValue();
    }
  }

  private beginEditing(): void {
    if (this.editing || !this.fieldActive) {
      return;
    }
    this.editing = true;
    if (this.editBuffer === "") {
      this.valueStringProperty.value = " ";
    } else {
      this.updateValueText();
    }
    this.fieldNode.focus();
  }

  private commitEditing(): void {
    if (!this.editing) {
      return;
    }
    this.editing = false;
    const parsed = parseNumber(this.editBuffer);
    if (parsed !== null) {
      this.onCommit(parsed);
    } else {
      this.updateValueText();
    }
  }

  private handleKeyDown(event: SceneryEvent): void {
    if (!this.fieldActive) {
      return;
    }

    if (!this.editing) {
      this.beginEditing();
    }

    const key = (event.domEvent as KeyboardEvent | null)?.key;
    if (!key) {
      return;
    }

    if (key === "Enter") {
      this.commitEditing();
      event.handle();
      return;
    }

    if (key === "Escape") {
      this.editing = false;
      this.updateValueText();
      event.handle();
      return;
    }

    if (key === "Backspace") {
      this.editBuffer = this.editBuffer.slice(0, -1);
      this.updateValueText();
      event.handle();
      return;
    }

    if (key === "-" && this.editBuffer.length === 0) {
      this.editBuffer = "-";
      this.updateValueText();
      event.handle();
      return;
    }

    if ((key === "." || key === "Decimal") && !this.editBuffer.includes(".")) {
      this.editBuffer =
        this.editBuffer === "" || this.editBuffer === "-" ? `${this.editBuffer}0.` : `${this.editBuffer}.`;
      this.updateValueText();
      event.handle();
      return;
    }

    if (/^\d$/.test(key)) {
      this.editBuffer += key;
      this.updateValueText();
      event.handle();
    }
  }

  private showUnknownValue(): void {
    this.valueStringProperty.value = StringManager.getInstance().getControls().unknownValueStringProperty.value;
  }

  private updateValueText(): void {
    if (!this.fieldActive) {
      this.showUnknownValue();
      return;
    }
    if (this.editing) {
      this.valueStringProperty.value = this.editBuffer === "" ? " " : this.editBuffer;
      return;
    }
    if (this.editBuffer === "") {
      this.showUnknownValue();
    } else {
      this.valueStringProperty.value = this.editBuffer;
    }
  }
}
