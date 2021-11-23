import {
	name,
	version
} from './package.json';

import {
	terser
} from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";

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
				preamble: "// Copyright (c) 2021 Sadret",
			},
		}),
	],
};
