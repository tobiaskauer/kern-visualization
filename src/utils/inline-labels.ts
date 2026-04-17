/**
 * Resolves vertical label collisions by nudging overlapping positions apart.
 * Returns positions in the same order as the input array.
 *
 * @param positions  Natural y positions (SVG coordinates, 0 = top)
 * @param minGap     Minimum pixel gap between adjacent labels
 * @param bounds     [min, max] clamping range (typically [0, innerHeight])
 */
export function resolveCollisions(
  positions: number[],
  minGap: number,
  bounds: [number, number]
): number[] {
  if (positions.length <= 1) return [...positions];

  // Work on index-tagged copies so we can restore original order
  const sorted = positions.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);

  // Forward pass: push labels down when too close to the one above
  for (let k = 1; k < sorted.length; k++) {
    if (sorted[k].y - sorted[k - 1].y < minGap) {
      sorted[k].y = sorted[k - 1].y + minGap;
    }
  }

  // Backward pass: pull labels up when too close to the one below
  for (let k = sorted.length - 2; k >= 0; k--) {
    if (sorted[k + 1].y - sorted[k].y < minGap) {
      sorted[k].y = sorted[k + 1].y - minGap;
    }
  }

  // Clamp to chart bounds
  for (const item of sorted) {
    item.y = Math.max(bounds[0], Math.min(bounds[1], item.y));
  }

  // Rebuild in original order
  const result = new Array<number>(positions.length);
  for (const item of sorted) {
    result[item.i] = item.y;
  }
  return result;
}
