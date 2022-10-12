import { defineConfig, loadEnv, UserConfig, UserConfigExport } from 'vite';

import glsl from 'vite-plugin-glsl';

import { resolve } from 'path';

export default ({ mode }: UserConfig): UserConfigExport => {
	if (mode) process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

	return defineConfig({
		build: {
			rollupOptions: {
				input: {
					main: resolve(__dirname, 'index.html'),
					nested: resolve(
						__dirname,
						'src/pages/courses/three JS Fundamentals Course - Learn Three.js from scratch/index.html'
					)
				}
			}
		},
		resolve: {
			alias: [
				{ find: '@', replacement: resolve(__dirname) },
				{ find: '@src', replacement: resolve(__dirname, 'src') },
				{ find: '@styles', replacement: resolve(__dirname, 'styles') },
				{ find: '@utils', replacement: resolve(__dirname, 'utils') }
			]
		},
		plugins: [glsl()]
	});
};
