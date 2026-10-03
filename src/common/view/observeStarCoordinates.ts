import type { ObservableArray } from "scenerystack/axon";
import type { Star } from "../model/Star.js";

/** Observe existing and newly added stars, unlinking before removal/disposal. */
export const observeStarCoordinates = (stars: ObservableArray<Star>, redraw: () => void): (() => void) => {
  const linkedStars = new Set<Star>();
  const linkStar = (star: Star): void => {
    star.raProperty.lazyLink(redraw);
    star.decProperty.lazyLink(redraw);
    linkedStars.add(star);
  };
  const unlinkStar = (star: Star): void => {
    star.raProperty.unlink(redraw);
    star.decProperty.unlink(redraw);
    linkedStars.delete(star);
  };
  const added = (star: Star): void => {
    linkStar(star);
    redraw();
  };
  const removed = (star: Star): void => {
    unlinkStar(star);
    redraw();
  };
  for (const star of stars) {
    linkStar(star);
  }
  stars.addItemAddedListener(added);
  stars.addItemRemovedListener(removed);

  return () => {
    stars.removeItemAddedListener(added);
    stars.removeItemRemovedListener(removed);
    for (const star of linkedStars) {
      unlinkStar(star);
    }
  };
};
