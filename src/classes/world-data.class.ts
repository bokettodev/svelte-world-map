import type { WorldData } from '../types/world-data.type';

export class WorldDataset {
	constructor(public lowResolution: WorldData, public middleResolution: WorldData) {}

	get minResolution(): WorldData {
		return this.lowResolution || this.middleResolution;
	}

	get maxResolution(): WorldData {
		return this.middleResolution || this.lowResolution;
	}
}
