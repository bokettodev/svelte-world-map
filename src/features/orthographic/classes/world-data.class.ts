import type { WorldData } from '@features/orthographic/types';

export class WorldDataset {
	constructor(public lowResolution: WorldData, public highResolution: WorldData) {}

	get minResolution(): WorldData {
		return this.lowResolution || this.highResolution;
	}

	get maxResolution(): WorldData {
		return this.highResolution || this.lowResolution;
	}
}
