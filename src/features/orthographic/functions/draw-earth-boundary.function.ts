import type { GeoPath } from 'd3';

export const drawEarthBoundary = ({
	context,
	pathGenerator,
	strokeColor
}: {
	context: CanvasRenderingContext2D;
	pathGenerator: GeoPath;
	strokeColor: string;
}): void => {
	context.beginPath();
	pathGenerator({ type: 'Sphere' });
	context.strokeStyle = strokeColor;
	context.stroke();
	context.closePath();
};
