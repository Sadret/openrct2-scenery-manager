import {
	name,
	version
} from './package.json';

import typescript from "@rollup/plugin-typescript";
import {
	terser
} from "rollup-plugin-terser";

export default {
	input: "./src/main.ts",
	output: {
		format: "iife",
		file: `./build/${name}-${version}.js`,
	},
	plugins: [
		typescript(),
		terser({
			format: {
				preamble: "// Copyright (c) 2025 Sadret",
			},
		}),
	],
};
