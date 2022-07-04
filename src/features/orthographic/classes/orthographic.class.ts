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
import { fitProjectionSize } from '../../../shared/functions/fit-projection-size';
import type { CanvasCountry } from '../interfaces/canvas-country.interface';
import type { WorldData } from '../types/world-data.type';
import type { WorldDataset } from './world-data.class';

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

	private canvasColor = 'white';
	private sphereColor = 'darkslategray';
	private waterColor = 'white';
	private boundariesColor = 'white';
	private earthColor = 'darkslategray';
	private hoverColor = 'green';

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
		this.countries = this.worldDataset.maxResolution.features.map((featureHighResolution) => {
			const featureLowResolution = this.worldDataset.minResolution.features.find(
				(f) => f.properties.name === featureHighResolution.properties.name
			);

			return {
				featureLowResolution,
				featureHighResolution,
				pathLowResolution: null,
				pathHighResolution: null,
				name: featureHighResolution.properties.name,
				color: this.earthColor,
				isHovered: false
			};
		});
	}

	setCanvasColor(color: string): void {
		this.canvasColor = color;
	}

	setSphereColor(color: string): void {
		this.sphereColor = color;
	}

	setWaterColor(color: string): void {
		this.waterColor = color;
	}

	setBoundariesColor(color: string): void {
		this.boundariesColor = color;
	}

	setEarthColor(color: string): void {
		this.earthColor = color;
		this.countries.forEach((c) => (!c.isHovered ? (c.color = color) : null));
	}

	setHoverColor(color: string): void {
		this.hoverColor = color;
		if (!this.hoveredCountry) {
			return;
		}
		this.hoveredCountry.color = color;
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
			this.hoveredCountry.color = this.earthColor;
			this.hoveredCountry.isHovered = false;
		}

		if (hoveredCountry) {
			this.hoveredCountry = hoveredCountry;
			this.hoveredCountry.color = this.hoverColor;
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
			this.canvasContext.clearRect(0, 0, this.width, this.height);
			this.canvasContext.fillStyle = this.canvasColor;
			this.canvasContext.fillRect(0, 0, this.width, this.height);

			this.drawWater();

			this.countries.forEach((country) => {
				this.drawCountry(country);
			});

			this.drawEarthBoundary();
		});
	}

	private drawWater(): void {
		this.canvasContext.beginPath();
		this.pathGeneratorWithContext({ type: 'Sphere' });
		this.canvasContext.fillStyle = this.waterColor;
		this.canvasContext.fill();
		this.canvasContext.closePath();
	}

	private drawCountry(country: CanvasCountry): void {
		const targetPath = this.processing ? country.pathLowResolution : country.pathHighResolution;
		if (!targetPath) {
			return;
		}

		this.canvasContext.beginPath();
		this.canvasContext.strokeStyle = this.boundariesColor;
		this.canvasContext.stroke(targetPath);
		this.canvasContext.fillStyle = country.color;
		this.canvasContext.fill(targetPath);
		this.canvasContext.closePath();
	}

	private drawEarthBoundary(): void {
		this.canvasContext.beginPath();
		this.pathGeneratorWithContext({ type: 'Sphere' });
		this.canvasContext.strokeStyle = this.sphereColor;
		this.canvasContext.stroke();
		this.canvasContext.closePath();
	}

	private get width(): number {
		return this.canvasContext.canvas.width;
	}

	private get height(): number {
		return this.canvasContext.canvas.height;
	}
}
