import type { ZoomTransform } from '../interfaces/zoom-transform.interface';

export function applyZoomTransform(
	canvasContext: CanvasRenderingContext2D,
	transform: ZoomTransform
): void {
	if (!canvasContext || !transform) {
		return;
	}
	canvasContext.translate(transform.x, transform.y);
	canvasContext.scale(transform.k, transform.k);
}
