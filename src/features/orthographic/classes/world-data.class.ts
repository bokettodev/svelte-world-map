import type { WorldData } from '../types/world-data.type';

export class WorldDataset {
	constructor(public lowResolution: WorldData, public highResolution: WorldData) {}

	get minResolution(): WorldData {
		return this.lowResolution || this.highResolution;
	}

	get maxResolution(): WorldData {
		return this.highResolution || this.lowResolution;
	}
}
