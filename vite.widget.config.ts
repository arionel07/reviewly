import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
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
