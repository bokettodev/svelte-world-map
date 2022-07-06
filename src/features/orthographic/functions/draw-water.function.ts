import type { GeoPath } from 'd3';

export const drawWater = ({
	context,
	pathGenerator,
	fillColor
}: {
	context: CanvasRenderingContext2D;
	pathGenerator: GeoPath;
	fillColor: string;
}): void => {
	context.beginPath();
	pathGenerator({ type: 'Sphere' });
	context.fillStyle = fillColor;
	context.fill();
	context.closePath();
};
