import { gui } from '@utils/common/tweakpaneGUI';
import {
	getAmbientLight,
	getBox,
	getDirectionalLight,
	getPlane,
	getPointLight,
	getSphere,
	getSpotLight,
	handleKeepPerspectiveCameraAspectRatioOnResize,
	getMaterial
} from '@utils/common/three';

import WebGL from 'three/examples/jsm/capabilities/WebGL';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import {
	BoxGeometry,
	Clock,
	DoubleSide,
	FogExp2,
	Group,
	Material,
	Mesh,
	MeshPhongMaterial,
	PerspectiveCamera,
	Scene,
	WebGL1Renderer
} from 'three';

import noisejs from 'noisejs';
// import { noisejs } from 'noisejs';

enum EAnimationsTypeBoxGrid {
	SIN = 'SIN',
	COS = 'COS',
	RANDOM = 'RANDOM'
}

const animationsType = {
	boxGrid: EAnimationsTypeBoxGrid.RANDOM
};

let zIncrementSign = -1;
const num = 0.1;

const noise = new (noisejs as any).Noise(Math.random());

const getBoxGrid = (amount: number, gapMultiplier: number) => {
	const group = new Group();

	let obj1: Mesh<BoxGeometry, Material>;
	let obj2: Mesh<BoxGeometry, Material>;
	let i = 0;
	let j = 1;
	getBox;
	for (; i < amount; i++) {
		obj1 = getBox(
			{ width: 1, height: 1, widthSegments: 1 },
			getMaterial('phong', { color: 'rgb(255, 255, 255)' })
		);
		obj1.position.x = i * gapMultiplier;
		obj1.position.y = obj1.geometry.parameters.height / 2;
		group.add(obj1);

		j = 1;
		for (; j < amount; j++) {
			obj2 = getBox(
				{ width: 1, height: 1, widthSegments: 1 },
				getMaterial('phong', { color: 'rgb(255, 255, 255)' })
			);
			obj2.position.x = i * gapMultiplier;
			obj2.position.y = obj2.geometry.parameters.height / 2;
			obj2.position.z = j * gapMultiplier;
			group.add(obj2);
		}
	}

	group.position.x = -(gapMultiplier * (amount - 1)) / 2;
	group.position.z = -(gapMultiplier * (amount - 1)) / 2;

	return group;
};

const update = (props: {
	renderer: WebGL1Renderer;
	scene: Scene;
	camera: PerspectiveCamera;
	controls: OrbitControls;
	stats: Stats;
	clock: Clock;
}) => {
	props.renderer.render(props.scene, props.camera);

	props.controls.update();
	props.stats.update();

	const timeElapsed = props.clock.getElapsedTime();

	const boxGrid = props.scene.getObjectByName('boxGrid') as Group;
	const cameraZPosGroup = props.scene.getObjectByName('cameraZPos') as Group;

	if (
		(zIncrementSign === -1 && cameraZPosGroup.position.z - num < -50) ||
		(zIncrementSign === 1 && cameraZPosGroup.position.z + num > 50)
	)
		zIncrementSign *= -1;

	cameraZPosGroup.position.z += num * zIncrementSign;

	if (animationsType.boxGrid === EAnimationsTypeBoxGrid.SIN)
		boxGrid.children.forEach((child, index) => {
			child.scale.y = (Math.sin(timeElapsed * 5 + index) + 1) * 0.49; // / 2 + 0.001;
			child.position.y = child.scale.y / 2;
		});
	else if (animationsType.boxGrid === EAnimationsTypeBoxGrid.COS)
		boxGrid.children.forEach((child, index) => {
			child.scale.y = (Math.cos(timeElapsed * 5 + index) + 1) * 0.49; // / 2 + 0.001;
			child.position.y = child.scale.y / 2;
		});
	else if (animationsType.boxGrid === EAnimationsTypeBoxGrid.RANDOM)
		boxGrid.children.forEach((child, index) => {
			child.scale.y =
				(noise.simplex2(
					timeElapsed * 0.75 + index,
					timeElapsed * 0.75 + index
				) +
					1) *
				0.49; // / 2 + 0.001;
			child.position.y = child.scale.y / 2;
		});

	// request Animation frame
	requestAnimationFrame(() => {
		update(props);
	});
};

const init = () => {
	const scene = new Scene();
	let enableFog = false;

	if (enableFog) scene.fog = new FogExp2(0xffffff, 0.2);

	const clock = new Clock();

	const camera = new PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		1,
		1000
	);
	camera.position.set(0, 4, 50);
	// camera.lookAt(new Vector3(0, 0, 0));

	const cameraXPosGroup = new Group();
	const cameraYPosGroup = new Group();
	const cameraZPosGroup = new Group();
	const cameraXRotationGroup = new Group();
	const cameraYRotationGroup = new Group();
	const cameraZRotationGroup = new Group();

	cameraZPosGroup.name = 'cameraZPos';

	const cameraFolder = gui.addFolder({
		title: 'Camera'
	});
	cameraFolder.addInput(cameraXPosGroup.position, 'x'); // camera
	cameraFolder.addInput(cameraYPosGroup.position, 'y'); // camera
	cameraFolder.addInput(cameraZPosGroup.position, 'z'); // camera
	cameraFolder.addInput(cameraXRotationGroup.rotation, 'x', {
		label: 'Rotation x',
		min: -Math.PI,
		max: Math.PI
	});
	cameraFolder.addInput(cameraYRotationGroup.rotation, 'y', {
		label: 'Rotation y',
		min: -Math.PI,
		max: Math.PI
	});
	cameraFolder.addInput(cameraZRotationGroup.rotation, 'z', {
		label: 'Rotation z',
		min: -Math.PI,
		max: Math.PI
	});

	cameraXPosGroup.add(camera);
	cameraYPosGroup.add(cameraXPosGroup);
	cameraZPosGroup.add(cameraYPosGroup);
	cameraXRotationGroup.add(cameraZPosGroup);
	// cameraXRotationGroup.add(camera);
	cameraYRotationGroup.add(cameraXRotationGroup);
	cameraZRotationGroup.add(cameraYRotationGroup);
	// // scene.add(cameraZRotationGroup)

	cameraXPosGroup.position.x = camera.position.x;
	cameraYPosGroup.position.y = camera.position.y;
	cameraZPosGroup.position.z = camera.position.z;

	const stats = Stats();
	document.body.appendChild(stats.dom);

	// The director

	// Populating the Scene in three js
	// const mesh = getBox(1, 1, 1, 'rgb(120, 120, 120)');
	// // mesh.position.y = mesh.geometry.parameters.height * 0.5;

	const boxGrid = getBoxGrid(10, 1.5);
	boxGrid.name = 'boxGrid';

	// Creating more geometry objects in three js
	const planeMaterial = new MeshPhongMaterial({
		color: 'rgb(120, 120, 120)',
		side: DoubleSide
	});
	const plane = getPlane(
		{ width: 20, height: 20, widthSegments: 20 },
		planeMaterial
	);
	plane.receiveShadow = true;
	plane.name = 'plane-1';
	plane.rotation.x = Math.PI / 2;

	const lightsGap = 0.1;

	const sphereMaterial = getMaterial('basic', { color: 0xffffff });

	const sphere1 = getSphere(
		{ radius: 0.05, widthSegments: 20, heightSegments: 20 },
		sphereMaterial
	);
	const planeLight = getPointLight(
		{ color: 0xffffff, intensity: 1 },
		(light) => {
			light.castShadow = true;
			light.position.y = 2;
			light.add(sphere1);
		}
	);

	const sphere2 = getSphere(
		{ radius: 0.05, widthSegments: 20, heightSegments: 20 },
		sphereMaterial
	);
	const spotLight = getSpotLight({ color: 0xffffff, intensity: 1 }, (light) => {
		light.castShadow = true;
	});

	spotLight.visible = false;
	spotLight.position.y = 2;
	spotLight.position.x =
		planeLight.position.x + sphere1.geometry.parameters.radius * 2 + lightsGap;
	spotLight.add(sphere2);

	const sphere3 = getSphere(
		{ radius: 0.05, widthSegments: 20, heightSegments: 20 },
		sphereMaterial
	);
	const directionalLight = getDirectionalLight(
		{ color: 0xffffff, intensity: 1 },
		(light) => {
			light.castShadow = true;
			light.shadow.camera.left = -10;
			light.shadow.camera.bottom = -10;
			light.shadow.camera.right = 10;
			light.shadow.camera.top = 10;
			//
			light.visible = false;
			light.position.y = 4;
			light.position.x = 13;
			light.position.z = 1;
			light.add(sphere3);
		}
	);
	directionalLight.visible = false;
	directionalLight.position.y = 4;
	directionalLight.position.x = 13;
	directionalLight.position.z = 1;
	directionalLight.add(sphere3);

	const sphere4 = getSphere(
		{ radius: 0.05, widthSegments: 20, heightSegments: 20 },
		sphereMaterial
	);
	sphere4.visible = false;
	const ambientLight = getAmbientLight(
		{
			color: 0xb2b1a5,
			intensity: 0.5
		},
		(light) => {
			light.visible = false;
			light.position.y = 2;
			light.position.x =
				spotLight.position.x +
				sphere2.geometry.parameters.radius * 2 +
				lightsGap;
			light.add(sphere4);
		}
	);

	// const sphere5 = getSphere(0.05, 20, 20, 0xffffff);
	// const rectAreaLight = getRectAreaLight(0xffffff, 1);
	// rectAreaLight.visible = false;
	// rectAreaLight.position.y = 2;
	// rectAreaLight.position.x =
	// 	ambientLight.position.x +
	// 	sphere4.geometry.parameters.radius * 2 +
	// 	lightsGap;
	// rectAreaLight.add(sphere5);

	scene.add(plane);
	scene.add(boxGrid);
	scene.add(cameraZRotationGroup);
	scene.add(planeLight);
	scene.add(spotLight);
	scene.add(directionalLight);
	scene.add(ambientLight);
	// scene.add(rectAreaLight);

	const animationsTypeFolder = gui.addFolder({
		title: 'Box Grid Animations Type'
	});
	animationsTypeFolder.addBlade({
		presetKey: 'boxGridAnimationType',
		view: 'list',
		label: 'Box Grid',
		options: Object.entries(EAnimationsTypeBoxGrid).map((item) => ({
			text: item[0],
			value: item[1]
		})),
		value: animationsType.boxGrid
		// view: 'list',
		// label: 'scene',
		// options: [
		// 	{ text: 'loading', value: 'LDG' },
		// 	{ text: 'menu', value: 'MNU' },
		// 	{ text: 'field', value: 'FLD' }
		// ],
		// value: 'LDG'
	});

	animationsTypeFolder.on('change', (event) => {
		const value = event.value as EAnimationsTypeBoxGrid;
		if (value in EAnimationsTypeBoxGrid) animationsType.boxGrid = value;
	});

	const planeLightFolder = gui.addFolder({
		title: 'Plane Light'
	});
	planeLightFolder.addInput(planeLight, 'visible');
	planeLightFolder.addInput(spotLight, 'penumbra', { min: 0, max: 10 });
	planeLightFolder.addInput(planeLight, 'intensity', { min: 0, max: 10 });
	planeLightFolder.addInput(planeLight.position, 'x', {
		min: 0,
		max: 100,
		step: 0.1
	});
	planeLightFolder.addInput(planeLight.position, 'y', {
		min: 0,
		max: 100,
		step: 0.1
	});
	planeLightFolder.addInput(planeLight.position, 'z', {
		min: 0,
		max: 100,
		step: 0.1
	});

	const spotLightFolder = gui.addFolder({
		title: 'Spot Light'
	});
	spotLightFolder.addInput(spotLight, 'visible');
	spotLightFolder.addInput(spotLight, 'penumbra', { min: 0, max: 10 });
	spotLightFolder.addInput(spotLight, 'intensity', { min: 0, max: 10 });
	spotLightFolder.addInput(spotLight.position, 'x', {
		min: 0,
		max: 100,
		step: 0.1
	});
	spotLightFolder.addInput(spotLight.position, 'y', {
		min: 0,
		max: 100,
		step: 0.1
	});
	spotLightFolder.addInput(spotLight.position, 'z', {
		min: 0,
		max: 100,
		step: 0.1
	});

	const directionalLightFolder = gui.addFolder({
		title: 'Directional Light'
	});
	directionalLightFolder.addInput(directionalLight, 'visible');
	// directionalLightFolder.addInput(directionalLight, 'p', { min: 0, max: 10 });
	directionalLightFolder.addInput(directionalLight, 'intensity', {
		min: 0,
		max: 10
	});
	directionalLightFolder.addInput(directionalLight.position, 'x', {
		min: 0,
		max: 100,
		step: 0.1
	});
	directionalLightFolder.addInput(directionalLight.position, 'y', {
		min: 0,
		max: 100,
		step: 0.1
	});
	directionalLightFolder.addInput(directionalLight.position, 'z', {
		min: 0,
		max: 100,
		step: 0.1
	});

	const ambientLightParams = {
		color: `#${ambientLight.color.getHexString()}`
	};

	const ambientLightFolder = gui.addFolder({
		title: 'Ambient Light'
	});
	ambientLightFolder.addInput(ambientLight, 'visible');
	// spotLightFolder.addInput(spotLight, 'penumbra', { min: 0, max: 10 });
	ambientLightFolder.addInput(ambientLight, 'intensity', {
		min: 0,
		max: 10
	});
	// ambientLightFolder.addInput(ambientLight.position, 'x', {
	// 	min: 0,
	// 	max: 100,
	// 	step: 0.1
	// });
	// ambientLightFolder.addInput(ambientLight.position, 'y', {
	// 	min: 0,
	// 	max: 100,
	// 	step: 0.1
	// });
	// ambientLightFolder.addInput(ambientLight.position, 'z', {
	// 	min: 0,
	// 	max: 100,
	// 	step: 0.1
	// });
	ambientLightFolder.addInput(ambientLightParams, 'color', {
		view: 'color',
		color: { alpha: true }
	});
	ambientLightFolder.on('change', (event) => {
		if (event.presetKey === 'color')
			ambientLight.color.set(ambientLightParams.color);
	});

	// const rectAreaLightFolder = gui.addFolder({
	// 	title: 'RectArea Light'
	// });
	// rectAreaLightFolder.addInput(rectAreaLight, 'visible');
	// // spotLightFolder.addInput(spotLight, 'penumbra', { min: 0, max: 10 });
	// rectAreaLightFolder.addInput(rectAreaLight, 'intensity', {
	// 	min: 0,
	// 	max: 10
	// });
	// rectAreaLightFolder.addInput(rectAreaLight.position, 'x', {
	// 	min: 0,
	// 	max: 100,
	step: 0.1;
	// });
	// rectAreaLightFolder.addInput(rectAreaLight.position, 'y', {
	// 	min: 0,
	// 	max: 100,
	step: 0.1;
	// });
	// rectAreaLightFolder.addInput(rectAreaLight.position, 'z', {
	// 	min: 0,
	// 	max: 100,
	step: 0.1;
	// });

	// getDirectionalLight

	const canvas = document.getElementById('webgl');
	if (!canvas) throw new Error('Can not find canvas');

	const renderer = new WebGL1Renderer({
		canvas,
		antialias: true
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;

	renderer.setClearColor('rgb(120, 120, 120)');

	document.body.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);

	if (WebGL.isWebGLAvailable()) {
		handleKeepPerspectiveCameraAspectRatioOnResize({ camera, scene, renderer });
		update({ renderer, scene, camera, controls, stats, clock });
	} else {
		const warning = WebGL.getWebGLErrorMessage();
		alert(warning.textContent);
	}

	return scene;
};

init();
