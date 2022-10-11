import { defineConfig, loadEnv, UserConfig, UserConfigExport } from 'vite';

import { resolve } from 'path';

export default ({ mode }: UserConfig): UserConfigExport => {
	if (mode) process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

	return defineConfig({
		resolve: {
			alias: [
				{ find: '@', replacement: resolve(__dirname) },
				{ find: '@src', replacement: resolve(__dirname, 'src') },
				{ find: '@style', replacement: resolve(__dirname, 'src/style') }
			]
		},
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
		}
	});
};
