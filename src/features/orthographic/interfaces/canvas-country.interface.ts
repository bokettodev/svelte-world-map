export interface CanvasCountry {
	featureLowResolution: GeoJSON.Feature;
	featureHighResolution: GeoJSON.Feature;
	pathLowResolution: Path2D;
	pathHighResolution: Path2D;
	name: string;
	color: string;
	isHovered: boolean;
}
