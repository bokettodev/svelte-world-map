import type { GeoProjection } from 'd3';
import type { WorldData } from '../types/world-data.type';

export function fitProjectionSize(
	projection: GeoProjection,
	width: number,
	height: number,
	data: WorldData
): void {
	if (!projection || !width || !height || !data) {
		return;
	}
	projection.fitSize([width, height], data);
}
