import type { WorldData } from '../types/world-data.type';

export class WorldDataset {
	lowResolution: WorldData;
	middleResolution: WorldData;

	get minResolution(): WorldData {
		return this.lowResolution || this.middleResolution;
	}

	get maxResolution(): WorldData {
		return this.middleResolution || this.lowResolution;
	}
}
