import Scene1 from './three/scene1';

document.addEventListener('DOMContentLoaded', () => {
	const scene1 = new Scene1();
	scene1.init();

	(window as any).scene1 = scene1;

	const disposeMainSceneButton = document.getElementById(
		'disposeMainScene'
	) as HTMLButtonElement;
	const initMainSceneButton = document.getElementById(
		'initMainScene'
	) as HTMLButtonElement;

	if (!disposeMainSceneButton)
		throw new Error(
			"disposeMainSceneButton doesn't exist, disposeMainSceneButton = ${disposeMainSceneButton}"
		);
	if (!initMainSceneButton)
		throw new Error(
			"initMainSceneButton doesn't exist, initMainSceneButton = ${initMainSceneButton}"
		);

	disposeMainSceneButton?.addEventListener('click', () => scene1.dispose());
	initMainSceneButton?.addEventListener('click', () => scene1.init());
});
