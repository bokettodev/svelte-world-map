import type { ZoomTransform } from '../interfaces/zoom-transform.interface';

export function restrictTransformByBoundaries(
	transform: ZoomTransform,
	boundaryX: number,
	boundaryY: number
): ZoomTransform {
	if (!transform || !boundaryX || !boundaryY) {
		return transform;
	}

	boundaryX = boundaryX * (transform.k - 1) * -1;
	if (transform.x < boundaryX) {
		transform.x = boundaryX;
	} else if (transform.x > 0) {
		transform.x = 0;
	}

	boundaryY = boundaryY * (transform.k - 1) * -1;
	if (transform.y < boundaryY) {
		transform.y = boundaryY;
	} else if (transform.y > 0) {
		transform.y = 0;
	}

	return transform;
}
