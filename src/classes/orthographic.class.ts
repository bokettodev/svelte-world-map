import { drag, geoOrthographic, geoPath, select, zoom, type GeoPath, type GeoProjection } from 'd3';
import versor from 'versor';
import { COUNTRY_COLOR } from '../enums/country-color.enum';
import type { CanvasCountry } from '../interfaces/canvas-country.interface';
import type { WorldDataset } from './world-data.class';
import type { ZoomTransform } from '../interfaces/zoom-transform.interface';
import { applyZoomTransform } from '../functions/apply-zoom-transform';
import { fitProjectionSize } from '../functions/fit-projection-size';
import { restrictTransformByBoundaries } from '../functions/restrict-transform';

export class Orthographic {
	private worldDataset: WorldDataset;
	private countries: CanvasCountry[];
	private hoveredCountry: CanvasCountry;

	private projection: GeoProjection;
	private canvasContext: CanvasRenderingContext2D;
	private pathGenerator: GeoPath;
	private pathGeneratorWithContext: GeoPath;
	private lastZoomTransform: ZoomTransform = { k: 1, x: 0, y: 0 };
	private isZooming = false;
	private isDragging = false;

	private versorOnDragStart: {
		cartesian: [number, number, number];
		matrix: [number, number, number];
		rotate: [number, number, number];
	};

	init(canvas: HTMLCanvasElement): void {
		this.initVariables(canvas);
		this.initDraggingListeners();
		this.initZoomListener();
		this.initHoverListener();
	}

	setWorldSataset(worldDataset: WorldDataset): void {
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
				color: COUNTRY_COLOR.DEFAULT,
				isHovered: false
			};
		});
	}

	drawMap(): void {
		fitProjectionSize(this.projection, this.width, this.height, this.worldDataset.maxResolution);
		this.renderCanvas();
	}

	private initVariables(canvas: HTMLCanvasElement): void {
		this.projection = geoOrthographic();
		this.canvasContext = canvas.getContext('2d');
		this.pathGenerator = geoPath(this.projection);
		this.pathGeneratorWithContext = geoPath(this.projection, this.canvasContext);
	}

	private initZoomListener(): void {
		select(this.canvasContext.canvas).call(
			zoom()
				.scaleExtent([1, 8])
				.on('start', () => (this.isZooming = true))
				.on('zoom', ({ transform }: { transform: ZoomTransform }) => {
					this.lastZoomTransform = restrictTransformByBoundaries(
						transform,
						this.width,
						this.height
					);
					this.renderCanvas();
				})
				.on('end', () => {
					this.isZooming = false;
					this.renderCanvas();
				})
		);
	}

	private initHoverListener(): void {
		select(this.canvasContext.canvas).on('mousemove', this.onMouseMove);
	}

	private onMouseMove = (event: MouseEvent): void => {
		if (this.mapProcessing || !this.countries?.length) {
			return;
		}

		this.canvasContext.save();
		applyZoomTransform(this.canvasContext, this.lastZoomTransform);

		const canvasRect = this.canvasContext.canvas.getBoundingClientRect();
		const offsetY = event.offsetY - canvasRect.y;
		const offsetX = event.offsetX - canvasRect.x;

		const hoveredCountry = this.countries.find((country) => {
			const targetPath = this.mapProcessing
				? country.pathLowResolution
				: country.pathHighResolution;
			return this.canvasContext.isPointInPath(targetPath, offsetX, offsetY);
		});
		if (this.hoveredCountry === hoveredCountry) {
			this.canvasContext.restore();
			return;
		}

		if (this.hoveredCountry) {
			this.hoveredCountry.color = COUNTRY_COLOR.DEFAULT;
			this.hoveredCountry.isHovered = false;
			this.drawCountry(this.hoveredCountry);

			if (!hoveredCountry) {
				this.drawCountriesBoundaries();
				this.drawEarthBoundary();
			}
		}

		if (hoveredCountry) {
			this.hoveredCountry = hoveredCountry;
			this.hoveredCountry.color = COUNTRY_COLOR.HOVERED;
			this.hoveredCountry.isHovered = true;
			this.drawCountry(this.hoveredCountry);

			this.drawCountriesBoundaries();
			this.drawEarthBoundary();
		} else {
			this.hoveredCountry = null;
		}

		this.canvasContext.restore();
	};

	private initDraggingListeners(): void {
		select(this.canvasContext.canvas).call(
			drag()
				.on('start', this.onDraggingStart)
				.on('drag', this.onDragging)
				.on('end', this.onDraggingEnd)
		);
	}

	private onDraggingStart = (event: DragEvent): void => {
		this.isDragging = true;
		const rotate = this.projection.rotate();
		this.versorOnDragStart = {
			rotate,
			cartesian: versor.cartesian(this.projection.invert([event.x, event.y])),
			matrix: versor(rotate)
		};
	};

	private onDragging = (event: DragEvent): void => {
		const cartesian = versor.cartesian(
			this.projection.rotate(this.versorOnDragStart.rotate).invert([event.x, event.y])
		);
		const matrix = versor.multiply(
			this.versorOnDragStart.matrix,
			versor.delta(this.versorOnDragStart.cartesian, cartesian)
		);

		this.projection.rotate(versor.rotation(matrix));
		window.requestAnimationFrame(this.renderCanvas);
	};

	private onDraggingEnd = (): void => {
		this.isDragging = false;
		this.renderCanvas();
	};

	private renderCanvas = (): void => {
		this.canvasContext.save();
		this.canvasContext.clearRect(0, 0, this.width, this.height);
		applyZoomTransform(this.canvasContext, this.lastZoomTransform);

		// Water
		this.canvasContext.beginPath();
		this.pathGeneratorWithContext({ type: 'Sphere' });
		this.canvasContext.fillStyle = 'white';
		this.canvasContext.fill();
		this.canvasContext.closePath();

		this.countries.forEach((country) => {
			this.drawCountry(country);
		});

		if (!this.mapProcessing) {
			this.drawCountriesBoundaries();
		}
		this.drawEarthBoundary();
		this.canvasContext.restore();
	};

	private drawCountry(country: CanvasCountry): void {
		const targetFeature = this.mapProcessing
			? country.featureLowResolution
			: country.featureHighResolution;
		if (!targetFeature) {
			return;
		}
		let targetPath: Path2D;

		if (this.mapProcessing) {
			targetPath = country.pathLowResolution = country.featureLowResolution
				? new Path2D(this.pathGenerator(country.featureLowResolution))
				: null;
		} else {
			targetPath = country.pathHighResolution = new Path2D(
				this.pathGenerator(country.featureHighResolution)
			);
		}

		this.canvasContext.beginPath();
		this.canvasContext.fillStyle = country.color;
		this.canvasContext.fill(targetPath);
		this.canvasContext.closePath();
	}

	private drawCountriesBoundaries(): void {
		this.countries.forEach((country) => {
			const targetPath = this.mapProcessing
				? country.pathLowResolution
				: country.pathHighResolution;
			if (!targetPath) {
				return;
			}

			this.canvasContext.beginPath();
			this.canvasContext.strokeStyle = 'white';
			this.canvasContext.stroke(targetPath);
			this.canvasContext.fillStyle = country.color;
			this.canvasContext.fill(targetPath);
			this.canvasContext.closePath();
		});
	}

	private drawEarthBoundary(): void {
		this.canvasContext.beginPath();
		this.pathGeneratorWithContext({ type: 'Sphere' });
		this.canvasContext.strokeStyle = 'darkslategray';
		this.canvasContext.stroke();
		this.canvasContext.closePath();
	}

	private get width(): number {
		return this.canvasContext.canvas.width;
	}

	private get height(): number {
		return this.canvasContext.canvas.height;
	}

	private get mapProcessing(): boolean {
		return this.isDragging || this.isZooming;
	}
}
