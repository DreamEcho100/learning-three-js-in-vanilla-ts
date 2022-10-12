import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import { BladeController, View } from '@tweakpane/core';

import { BladeApi, Pane } from 'tweakpane';

interface FPSGraph extends BladeApi<BladeController<View>> {
	begin(): void;
	end(): void;
}
// Debug
export const gui = new Pane();
gui.registerPlugin(EssentialsPlugin);

export const fpsGraph = gui.addBlade({
	view: 'fpsgraph',
	label: 'fpsgraph'
});
