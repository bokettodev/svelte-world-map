import type {
	ExtendedFeature,
	ExtendedFeatureCollection,
	ExtendedGeometryCollection,
	GeoGeometryObjects,
	GeoProjection
} from 'd3';

export const fitProjectionSize = (
	projection: GeoProjection,
	width: number,
	height: number,
	data:
		| ExtendedFeature
		| ExtendedFeatureCollection
		| GeoGeometryObjects
		| ExtendedGeometryCollection
): void => {
	if (!projection || !width || !height || !data) {
		return;
	}
	projection.fitSize([width, height], data);
};
