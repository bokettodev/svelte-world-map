import type { WorldDataset } from '@features/orthographic/classes';
import type { CanvasCountry } from '@features/orthographic/interfaces';

export const worldFatasetToCountries = ({
	worldDataset,
	countriesColor
}: {
	worldDataset: WorldDataset;
	countriesColor: string;
}): CanvasCountry[] => {
	return worldDataset.maxResolution.features.map((featureHighResolution) => {
		const featureLowResolution = worldDataset.minResolution.features.find(
			(f) => f.properties.name === featureHighResolution.properties.name
		);

		return {
			featureLowResolution,
			featureHighResolution,
			pathLowResolution: null,
			pathHighResolution: null,
			name: featureHighResolution.properties.name,
			color: countriesColor,
			isHovered: false
		};
	});
};
