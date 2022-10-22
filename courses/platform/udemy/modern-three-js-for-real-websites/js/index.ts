// https://www.npmjs.com/package/camera-controls?activeTab=readme

import gsap from 'gsap';

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

	disposeMainSceneButton?.addEventListener('click', () => {
		scene1.dispose();
		document.getElementById('text-container')!.style.pointerEvents = 'auto';
		mainTimeline.to('#text-container', { opacity: 1 });
	});
	initMainSceneButton?.addEventListener('click', () => scene1.init());

	const mainTimeline = gsap.timeline().to(
		// ['#authorName', '#oneWithAn', '#viewWorkBtn']
		'#text-container > *',
		{
			opacity: 1,
			y: 0,
			ease: 'expo',
			duration: 1,
			stagger: 0.3,
			delay: 0.1
		}
	);

	document.querySelector('#viewWorkBtn')?.addEventListener('click', (e) => {
		e.preventDefault();

		scene1.controls.reset();
		scene1.controls.enabled = false;

		document.getElementById('text-container')!.style.pointerEvents = 'none';
		mainTimeline
			.to('#text-container', { opacity: 0 })
			.to(
				// scene1.camera.position,
				scene1.controls.object.position,
				{
					z: 25,
					ease: 'power3.inOut',
					duration: 2
				}
			)
			.to(
				// scene1.camera.rotation,
				scene1.controls.object.rotation,
				{
					x: (90 * Math.PI) / 180,
					ease: 'power3.inOut',
					duration: 2
				},
				'<'
			)
			.to(
				// scene1.camera.position,
				scene1.controls.object.position,
				{
					y: 1000,
					ease: 'power3.in',
					duration: 1
				},
				'>'
			);
		// .then(() => {
		// 	scene1.controls.enabled = true;
		// });
	});
});
