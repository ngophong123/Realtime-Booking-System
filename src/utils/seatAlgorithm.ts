import type { Seat } from '../types';

export type AutoSelectMode = 'CENTER' | 'VIP' | 'COUPLE' | 'BUDGET';

interface FindBestSeatsOptions {
  seats: Seat[];
  bookedSeatIds: string[];
  heldSeatIds: string[];
  quantity: number;
  mode: AutoSelectMode;
}

export function findBestSeats({
  seats,
  bookedSeatIds,
  heldSeatIds,
  quantity,
  mode,
}: FindBestSeatsOptions): Seat[] | null {
  if (!seats || seats.length === 0 || quantity <= 0) return null;

  // Filter available seats
  const unavailableSet = new Set([...bookedSeatIds, ...heldSeatIds]);
  const availableSeats = seats.filter((s) => !unavailableSet.has(s.id));

  // Determine grid dimensions
  const rowLabels = Array.from(new Set(seats.map((s) => s.row))).sort();
  const maxCol = Math.max(...seats.map((s) => s.column));
  const numRows = rowLabels.length;

  // Sweet spot row index (roughly 55% to 70% back from the screen)
  const optimalRowIdx = Math.floor(numRows * 0.6);
  const optimalCol = (maxCol + 1) / 2;

  // Group available seats by row
  const availableByRow: { [row: string]: Seat[] } = {};
  availableSeats.forEach((s) => {
    if (!availableByRow[s.row]) availableByRow[s.row] = [];
    availableByRow[s.row].push(s);
  });

  const candidates: { seats: Seat[]; score: number }[] = [];

  rowLabels.forEach((row, rowIdx) => {
    const rowSeats = (availableByRow[row] || []).sort((a, b) => a.column - b.column);
    if (rowSeats.length < quantity) return;

    // Check contiguous blocks of `quantity` seats
    for (let i = 0; i <= rowSeats.length - quantity; i++) {
      const block = rowSeats.slice(i, i + quantity);

      // Check if columns are consecutive
      let isConsecutive = true;
      for (let j = 0; j < block.length - 1; j++) {
        if (block[j + 1].column - block[j].column !== 1) {
          isConsecutive = false;
          break;
        }
      }

      if (!isConsecutive) continue;

      // Calculate quality score (Lower score = Better / Closer to ideal spot)
      const avgCol = block.reduce((sum, s) => sum + s.column, 0) / quantity;
      const rowDistance = Math.abs(rowIdx - optimalRowIdx);
      const colDistance = Math.abs(avgCol - optimalCol);

      let baseScore = rowDistance * 2.0 + colDistance * 1.0;

      // Mode-specific penalties / bonuses
      if (mode === 'VIP') {
        const vipCount = block.filter((s) => s.type === 'VIP').length;
        baseScore -= vipCount * 5; // Strong bonus for VIP
      } else if (mode === 'COUPLE') {
        const coupleCount = block.filter((s) => s.type === 'COUPLE').length;
        baseScore -= coupleCount * 8; // Strong bonus for Couple
        // Bonus for back rows
        if (rowIdx >= numRows - 2) baseScore -= 3;
      } else if (mode === 'BUDGET') {
        const standardCount = block.filter((s) => s.type === 'STANDARD').length;
        baseScore -= standardCount * 3;
      }

      candidates.push({ seats: block, score: baseScore });
    }
  });

  if (candidates.length === 0) {
    // If no contiguous block found on the same row, fallback to best individual available seats
    if (quantity === 1 && availableSeats.length > 0) {
      const sorted = [...availableSeats].sort((a, b) => {
        const aRowIdx = rowLabels.indexOf(a.row);
        const bRowIdx = rowLabels.indexOf(b.row);
        const aScore = Math.abs(aRowIdx - optimalRowIdx) * 2 + Math.abs(a.column - optimalCol);
        const bScore = Math.abs(bRowIdx - optimalRowIdx) * 2 + Math.abs(b.column - optimalCol);
        return aScore - bScore;
      });
      return [sorted[0]];
    }
    return null;
  }

  candidates.sort((a, b) => a.score - b.score);
  return candidates[0].seats;
}
