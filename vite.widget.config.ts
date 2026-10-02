import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src')
		}
	},

	// outDir lives inside the Next.js app's own `public/`, which Vite also
	// treats as its default static-asset publicDir — without disabling it,
	// every build re-copies all of `public/` (including itself) into
	// public/widget, duplicating files there.
	publicDir: false,

	build: {
		lib: {
			entry: resolve(__dirname, 'src/widget/index.ts'),
			name: 'ReviewlyWidget',
			formats: ['iife'],
			fileName: () => 'widget.js'
		},

		outDir: 'public/widget',

		emptyOutDir: true,

		minify: true
	}
})
