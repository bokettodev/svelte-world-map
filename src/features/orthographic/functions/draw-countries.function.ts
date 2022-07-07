import type { CanvasCountry } from '@features/orthographic/interfaces';

export const drawCountries = ({
	context,
	countries,
	strokeColor,
	lowResolution
}: {
	context: CanvasRenderingContext2D;
	countries: CanvasCountry[];
	strokeColor: string;
	lowResolution: boolean;
}): void => {
	countries.forEach((country) => {
		drawCountry({
			context,
			country,
			strokeColor,
			fillColor: country.color,
			lowResolution
		});
	});
};

const drawCountry = ({
	context,
	country,
	strokeColor,
	fillColor,
	lowResolution
}: {
	context: CanvasRenderingContext2D;
	country: CanvasCountry;
	strokeColor: string;
	fillColor: string;
	lowResolution: boolean;
}): void => {
	const targetPath = lowResolution ? country.pathLowResolution : country.pathHighResolution;
	if (!targetPath) {
		return;
	}

	context.beginPath();
	context.strokeStyle = strokeColor;
	context.stroke(targetPath);
	context.fillStyle = fillColor;
	context.fill(targetPath);
	context.closePath();
};
