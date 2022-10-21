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

	disposeMainSceneButton?.addEventListener('click', () => scene1.dispose());
	initMainSceneButton?.addEventListener('click', () => scene1.init());

	// gsap.to('#authorName', {
	// 	opacity: 1,
	// 	duration: 1.5,
	// 	y: 0,
	// 	ease: 'expo'
	// });

	// gsap.to('#oneWithAn', {
	// 	opacity: 1,
	// 	duration: 1.5,
	// 	delay: 0.3,
	// 	y: 0,
	// 	ease: 'expo'
	// });

	// gsap.to('#viewWorkBtn', {
	// 	opacity: 1,
	// 	duration: 1.5,
	// 	delay: 0.6,
	// 	y: 0,
	// 	ease: 'expo'
	// });

	const mainTimeline = gsap.timeline().to(
		// '#text-container',
		// ['h1', 'p', 'a']
		['#authorName', '#oneWithAn', '#viewWorkBtn'],
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

		// const scene1Controls = {
		// 	rotation: {
		// 		x: scene1.controls.getPolarAngle()
		// 	}
		// };

		scene1.controls.reset();

		document.getElementById('text-container')!.style.pointerEvents = 'none';
		mainTimeline
			.to('#text-container', { opacity: 0 })
			.to(scene1.camera.position, {
				z: 25,
				ease: 'power3.inOut',
				duration: 2
			})
			.to(
				scene1.camera.rotation,
				{
					x: (90 * Math.PI) / 180,
					ease: 'power3.inOut',
					duration: 2
				},
				'<'
			)
			.to(
				scene1.camera.position,
				{
					y: 1000,
					ease: 'power3.in',
					duration: 1
				},
				'>'
			)
			.then(() => {
				// scene1.controls.enabled = true;
			});
	});
});
