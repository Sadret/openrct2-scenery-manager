import typescript from '@rollup/plugin-typescript';

export default {
	input: './src/index.ts',
	output: {
		format: 'iife',
		file: './build/out.js',
	},
	plugins: [typescript()],
};