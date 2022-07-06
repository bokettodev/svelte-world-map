<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { debounce } from '../../../shared/functions/debounce';
	import { Orthographic } from '../classes/orthographic.class';
	import type { WorldDataset } from '../classes/world-data.class';
	import type { Colors } from '../interfaces/colors.interface';

	export let worldDataset: WorldDataset | null;
	export let width: number;
	export let height: number;

	const orthographic = new Orthographic();

	let canvas: HTMLCanvasElement;
	const colors: Colors = {
		countriesBoundaries: '#ffffff',
		canvasBackground: '#cfcfcf',
		earth: '#2f4f4f',
		countryHover: '#3e9987',
		sphereBoundary: '#2f4f4f',
		water: '#ffffff'
	};

	let orthographicInited = false;
	let mapInited = false;
	const resizeDebounceMs = 300;

	const onResize = debounce(() => {
		orthographic.drawMapWithCalculations();
	}, resizeDebounceMs);

	beforeUpdate((): void => {
		initMap();
	});

	const initOrthographic = (): void => {
		if (orthographicInited || !canvas) {
			return;
		}
		orthographicInited = true;
		orthographic.init(canvas);
	};

	const initMap = (): void => {
		initOrthographic();
		if (!orthographicInited || mapInited || !worldDataset) {
			return;
		}

		mapInited = true;
		orthographic.setWorldDataset(worldDataset);

		orthographic.setColors(colors);

		orthographic.drawMapWithCalculations();
	};

	const onColorChange = (): void => {
		orthographic.setColors(colors);
		orthographic.drawMapWithoutCalculations();
	};
</script>

<svelte:window on:resize={onResize} />

<canvas bind:this={canvas} {width} {height} />

<div class="colors">
	<div class="color">
		<p>Background</p>
		<input type="color" bind:value={colors.canvasBackground} on:change={onColorChange} />
	</div>

	<div class="color">
		<p>Sphere</p>
		<input type="color" bind:value={colors.sphereBoundary} on:change={onColorChange} />
	</div>

	<div class="color">
		<p>Water</p>
		<input type="color" bind:value={colors.water} on:change={onColorChange} />
	</div>

	<div class="color">
		<p>Boundaries</p>
		<input type="color" bind:value={colors.countriesBoundaries} on:change={onColorChange} />
	</div>

	<div class="color">
		<p>Earth</p>
		<input type="color" bind:value={colors.earth} on:change={onColorChange} />
	</div>

	<div class="color">
		<p>Hover</p>
		<input type="color" bind:value={colors.countryHover} on:change={onColorChange} />
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
