<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { debounce } from '../functions/debounce';
	import { Orthographic } from '../classes/orthographic.class';
	import type { WorldDataset } from '../classes/world-data.class';

	export let worldDataset: WorldDataset;
	export let width: number;
	export let height: number;

	const orthographic = new Orthographic();

	let canvas: HTMLCanvasElement;
	let canvasColor = '#cfcfcf';
	let sphereColor = '#2f4f4f';
	let waterColor = '#ffffff';
	let boundariesColor = '#ffffff';
	let earthColor = '#2f4f4f';
	let hoverColor = '#3e9987';

	let orthographicInited = false;
	let mapInited = false;
	const resizeDebounceMs = 300;

	const onResize = debounce(() => {
		orthographic.drawMapWithCalculations();
	}, resizeDebounceMs);

	beforeUpdate((): void => {
		initMap();
	});

	function initOrthographic(): void {
		if (orthographicInited || !canvas) {
			return;
		}
		orthographicInited = true;
		orthographic.init(canvas);
	}

	function initMap(): void {
		initOrthographic();
		if (!orthographicInited || mapInited || !worldDataset) {
			return;
		}

		mapInited = true;
		orthographic.setWorldDataset(worldDataset);

		orthographic.setCanvasColor(canvasColor);
		orthographic.setSphereColor(sphereColor);
		orthographic.setWaterColor(waterColor);
		orthographic.setBoundariesColor(boundariesColor);
		orthographic.setEarthColor(earthColor);
		orthographic.setHoverColor(hoverColor);

		orthographic.drawMapWithCalculations();
	}

	const onCanvasColorChange = (): void => {
		orthographic.setCanvasColor(canvasColor);
		orthographic.drawMapWithoutCalculations();
	};

	const onSphereColorChange = (): void => {
		orthographic.setSphereColor(sphereColor);
		orthographic.drawMapWithoutCalculations();
	};

	const onWaterColorChange = (): void => {
		orthographic.setWaterColor(waterColor);
		orthographic.drawMapWithoutCalculations();
	};

	const onBoundariesColorChange = (): void => {
		orthographic.setBoundariesColor(boundariesColor);
		orthographic.drawMapWithoutCalculations();
	};

	const onEarthColorChange = (): void => {
		orthographic.setEarthColor(earthColor);
		orthographic.drawMapWithoutCalculations();
	};

	const onHoverColorChange = (): void => {
		orthographic.setHoverColor(hoverColor);
		orthographic.drawMapWithoutCalculations();
	};
</script>

<svelte:window on:resize={onResize} />

<canvas bind:this={canvas} {width} {height} />

<div class="colors">
	<div class="color">
		<p>Background</p>
		<input type="color" bind:value={canvasColor} on:change={onCanvasColorChange} />
	</div>

	<div class="color">
		<p>Sphere</p>
		<input type="color" bind:value={sphereColor} on:change={onSphereColorChange} />
	</div>

	<div class="color">
		<p>Water</p>
		<input type="color" bind:value={waterColor} on:change={onWaterColorChange} />
	</div>

	<div class="color">
		<p>Boundaries</p>
		<input type="color" bind:value={boundariesColor} on:change={onBoundariesColorChange} />
	</div>

	<div class="color">
		<p>Earth</p>
		<input type="color" bind:value={earthColor} on:change={onEarthColorChange} />
	</div>

	<div class="color">
		<p>Hover</p>
		<input type="color" bind:value={hoverColor} on:change={onHoverColorChange} />
	</div>
</div>

<style lang="scss">
	.colors {
		position: absolute;
		display: flex;
		flex-direction: column;
		top: 1.25rem;
		right: 1.25rem;
		gap: 0.75rem;
	}

	.color {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	canvas {
		position: absolute;
		top: 0;
		left: 0;
	}
</style>
