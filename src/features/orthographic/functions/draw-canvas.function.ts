export const drawCanvas = ({
	context,
	width,
	height,
	fillColor
}: {
	context: CanvasRenderingContext2D;
	width: number;
	height: number;
	fillColor: string;
}): void => {
	context.clearRect(0, 0, width, height);
	context.fillStyle = fillColor;
	context.fillRect(0, 0, width, height);
};
