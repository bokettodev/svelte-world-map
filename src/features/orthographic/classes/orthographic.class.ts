import type { WorldDataset } from '@features/orthographic/classes/world-data.class';
import {
	drawCanvas,
	drawCountries,
	drawEarthBoundary,
	drawWater,
	worldFatasetToCountries
} from '@features/orthographic/functions';
import type { CanvasCountry, Colors } from '@features/orthographic/interfaces';
import type { WorldData } from '@features/orthographic/types';
import { fitProjectionSize } from '@shared';
import {
	geoOrthographic,
	geoPath,
	pointer,
	select,
	zoom,
	type D3ZoomEvent,
	type GeoPath,
	type GeoProjection
} from 'd3';
import versor from 'versor';

export class Orthographic {
	private worldDataset: WorldDataset;
	private countries: CanvasCountry[];
	private hoveredCountry: CanvasCountry;

	private projection: GeoProjection;
	private canvasContext: CanvasRenderingContext2D;
	private pathGenerator: GeoPath;
	private pathGeneratorWithContext: GeoPath;
	private processing = false;

	private versorOnDragStart: {
		cartesian: [number, number, number];
		matrix: [number, number, number];
		rotate: [number, number, number];
	};

	private colors: Colors = {
		countriesBoundaries: 'white',
		canvasBackground: 'darkslategray',
		earth: 'darkslategray',
		countryHover: 'green',
		sphereBoundary: 'darkslategray',
		water: 'white'
	};

	private get width(): number {
		return this.canvasContext.canvas.width;
	}

	private get height(): number {
		return this.canvasContext.canvas.height;
	}

	init(canvas: HTMLCanvasElement): void {
		this.initVariables(canvas);
		this.initPanAndZoomListener();
		this.initHoverListener();
	}

	setWorldDataset(worldDataset: WorldDataset): void {
		if (
			!worldDataset?.lowResolution?.features?.length ||
			!worldDataset?.highResolution?.features?.length
		) {
			return;
		}

		this.worldDataset = worldDataset;
		this.countries = worldFatasetToCountries({ worldDataset, countriesColor: this.colors.earth });
	}

	setColors(colors: Partial<Colors>): void {
		if (colors.earth !== this.colors.earth) {
			this.countries.forEach((c) => (!c.isHovered ? (c.color = colors.earth) : null));
		}
		if (colors.countryHover !== this.colors.countryHover && this.hoveredCountry) {
			this.hoveredCountry.color = colors.countryHover;
		}
		Object.assign(this.colors, colors);
	}

	drawMapWithCalculations(): void {
		fitProjectionSize(this.projection, this.width, this.height, this.worldDataset.maxResolution);
		this.setCountriesPaths();
		this.renderCanvas();
	}

	drawMapWithoutCalculations(): void {
		this.renderCanvas();
	}

	private initVariables(canvas: HTMLCanvasElement): void {
		this.projection = geoOrthographic();
		this.canvasContext = canvas.getContext('2d');
		this.pathGenerator = geoPath(this.projection);
		this.pathGeneratorWithContext = geoPath(this.projection, this.canvasContext);
	}

	private initPanAndZoomListener(): void {
		select(this.canvasContext.canvas).call(
			zoom()
				.scaleExtent([0.1, 10])
				.on('start', (event: D3ZoomEvent<HTMLCanvasElement, WorldData>) => {
					this.processing = true;

					const rotate = this.projection.rotate();
					this.versorOnDragStart = {
						rotate,
						cartesian: versor.cartesian(
							this.projection.invert(pointer(event.sourceEvent, this.canvasContext.canvas))
						),
						matrix: versor(rotate)
					};
				})
				.on('zoom', (event: D3ZoomEvent<HTMLCanvasElement, WorldData>) => {
					this.projection.scale(event.transform.k * (this.height / 2));

					const cartesian = versor.cartesian(
						this.projection
							.rotate(this.versorOnDragStart.rotate)
							.invert(pointer(event.sourceEvent, this.canvasContext.canvas))
					);
					const matrix = versor.multiply(
						this.versorOnDragStart.matrix,
						versor.delta(this.versorOnDragStart.cartesian, cartesian)
					);

					this.projection.rotate(versor.rotation(matrix));
					this.setCountriesPaths();
					this.renderCanvas();
				})
				.on('end', () => {
					this.processing = false;
					this.setCountriesPaths();
					this.renderCanvas();
				})
		);
	}

	private initHoverListener(): void {
		select(this.canvasContext.canvas).on('mousemove', this.onMouseMove);
	}

	private onMouseMove = (event: MouseEvent): void => {
		if (this.processing || !this.countries?.length) {
			return;
		}

		const canvasRect = this.canvasContext.canvas.getBoundingClientRect();
		const offsetY = event.offsetY - canvasRect.y;
		const offsetX = event.offsetX - canvasRect.x;

		const hoveredCountry = this.countries.find((country) => {
			const targetPath = this.processing ? country.pathLowResolution : country.pathHighResolution;
			return this.canvasContext.isPointInPath(targetPath, offsetX, offsetY);
		});
		if (this.hoveredCountry === hoveredCountry) {
			return;
		}

		if (this.hoveredCountry) {
			this.hoveredCountry.color = this.colors.earth;
			this.hoveredCountry.isHovered = false;
		}

		if (hoveredCountry) {
			this.hoveredCountry = hoveredCountry;
			this.hoveredCountry.color = this.colors.countryHover;
			this.hoveredCountry.isHovered = true;
		} else {
			this.hoveredCountry = null;
		}

		this.renderCanvas();
	};

	private setCountriesPaths(): void {
		if (this.processing) {
			this.countries.forEach((country) => {
				country.pathLowResolution = country.featureLowResolution
					? new Path2D(this.pathGenerator(country.featureLowResolution))
					: null;
			});
		} else {
			this.countries.forEach((country) => {
				country.pathHighResolution = new Path2D(this.pathGenerator(country.featureHighResolution));
			});
		}
	}

	private renderCanvas(): void {
		window.requestAnimationFrame(() => {
			drawCanvas({
				context: this.canvasContext,
				width: this.width,
				height: this.height,
				fillColor: this.colors.canvasBackground
			});

			drawWater({
				context: this.canvasContext,
				pathGenerator: this.pathGeneratorWithContext,
				fillColor: this.colors.water
			});

			drawCountries({
				context: this.canvasContext,
				countries: this.countries,
				strokeColor: this.colors.countriesBoundaries,
				lowResolution: this.processing
			});

			drawEarthBoundary({
				context: this.canvasContext,
				pathGenerator: this.pathGeneratorWithContext,
				strokeColor: this.colors.sphereBoundary
			});
		});
	}
}
