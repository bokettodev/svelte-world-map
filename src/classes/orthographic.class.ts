import { drag, geoOrthographic, geoPath, select, type GeoPath, type GeoProjection } from 'd3';
import versor from 'versor';
import type { WorldData } from '../types/world-data.type';
import type { WorldDataset } from './world-data.class';

export class Orthographic {
	data: WorldDataset;

	private d3: {
		projection: GeoProjection;
		canvasContext: CanvasRenderingContext2D;
		pathGenerator: GeoPath;
	};

	private versorOnDragStart: {
		cartesian: [number, number, number];
		matrix: [number, number, number];
		rotate: [number, number, number];
	};

	init(canvas: HTMLCanvasElement): void {
		this.initVariables(canvas);
		this.initDragging();
	}

	drawMap(): void {
		this.fitProjectionSize(this.data.maxResolution);
		this.renderCanvas(this.data.maxResolution);
	}

	private initVariables(canvas: HTMLCanvasElement): void {
		const projection = geoOrthographic();
		const canvasContext = canvas.getContext('2d');
		this.d3 = { projection, canvasContext, pathGenerator: geoPath(projection, canvasContext) };
	}

	private initDragging(): void {
		select(this.d3.canvasContext.canvas).call(
			drag()
				.on('start', this.onDraggingStart)
				.on('drag', this.onDragging)
				.on('end', this.onDraggingEnd)
		);
	}

	private onDraggingStart = (event: DragEvent): void => {
		const rotate = this.d3.projection.rotate();
		this.versorOnDragStart = {
			rotate,
			cartesian: versor.cartesian(this.d3.projection.invert([event.x, event.y])),
			matrix: versor(rotate)
		};
	};

	private onDragging = (event: DragEvent): void => {
		const cartesian = versor.cartesian(
			this.d3.projection.rotate(this.versorOnDragStart.rotate).invert([event.x, event.y])
		);
		const matrix = versor.multiply(
			this.versorOnDragStart.matrix,
			versor.delta(this.versorOnDragStart.cartesian, cartesian)
		);

		this.d3.projection.rotate(versor.rotation(matrix));
		this.renderCanvas(this.data.minResolution);
	};

	private onDraggingEnd = (): void => {
		this.renderCanvas(this.data.maxResolution);
	};

	private renderCanvas(data: WorldData): void {
		this.d3.canvasContext.clearRect(0, 0, this.width, this.height);

		this.d3.canvasContext.beginPath();
		this.d3.pathGenerator({ type: 'Sphere' });
		this.d3.canvasContext.fillStyle = 'white';
		this.d3.canvasContext.fill();

		data.features.forEach((feature) => {
			this.d3.canvasContext.beginPath();
			this.d3.pathGenerator(feature);
			this.d3.canvasContext.strokeStyle = 'white';
			this.d3.canvasContext.stroke();
			this.d3.canvasContext.fillStyle = 'darkslategray';
			this.d3.canvasContext.fill();
		});

		this.d3.canvasContext.beginPath();
		this.d3.pathGenerator({ type: 'Sphere' });
		this.d3.canvasContext.strokeStyle = 'darkslategray';
		this.d3.canvasContext.stroke();
	}

	private fitProjectionSize(data: WorldData): void {
		this.d3.projection.fitSize([this.width, this.height], data);
	}

	private get width(): number {
		return this.d3.canvasContext.canvas.width;
	}

	private get height(): number {
		return this.d3.canvasContext.canvas.height;
	}

	
}
