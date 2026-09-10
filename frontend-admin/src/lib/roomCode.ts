import type { CreateRoomInput } from '../api/structure';

const PREFIXES: Record<CreateRoomInput['type'], string> = {
  LECTURE: 'L',
  LAB: 'LAB',
  LARGE_LECTURE_HALL: 'LH',
};

export function generateNextRoomCode(
  buildingCode: string,
  floorNumber: number,
  sideCode: string,
  type: CreateRoomInput['type'],
  existingCodesOnThisSide: string[],
): string {
  const base = `${buildingCode}-${String(floorNumber).padStart(2, '0')}${sideCode}`;
  const prefix = PREFIXES[type];
  const pattern = new RegExp(`^${base}-${prefix}(\\d+)$`);

  let maxNumber = 0;
  for (const code of existingCodesOnThisSide) {
    const match = code.match(pattern);
    if (match) maxNumber = Math.max(maxNumber, parseInt(match[1], 10));
  }

  const nextNumber = maxNumber + 1;
  const numberStr = type === 'LECTURE' ? String(nextNumber).padStart(2, '0') : String(nextNumber);
  return `${base}-${prefix}${numberStr}`;
}