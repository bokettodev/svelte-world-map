export const debounce = (fn: (...args: unknown[]) => void, delayMs: number) => {
	let timer: NodeJS.Timeout;
	return (...args: unknown[]) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			fn.apply(this, args);
		}, delayMs);
	};
};
