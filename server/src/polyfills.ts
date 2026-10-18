// Polyfill Promise.withResolvers cho môi trường Node.js < v22 (hỗ trợ tedious / mssql 12)
if (typeof (Promise as unknown as { withResolvers?: unknown }).withResolvers !== 'function') {
	Object.defineProperty(Promise, 'withResolvers', {
		value: function <T>() {
			let resolve!: (value: T | PromiseLike<T>) => void
			let reject!: (reason?: unknown) => void
			const promise = new Promise<T>((res, rej) => {
				resolve = res
				reject = rej
			})
			return { promise, resolve, reject }
		},
		writable: true,
		configurable: true,
	})
}

export {}
