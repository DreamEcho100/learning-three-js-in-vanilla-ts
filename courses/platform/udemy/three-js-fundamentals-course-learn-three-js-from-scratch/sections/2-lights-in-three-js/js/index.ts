// import { gui } from '@utils/common/gui';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import {
	AmbientLight,
	BoxGeometry,
	DirectionalLight,
	DoubleSide,
	FogExp2,
	Group,
	Mesh,
	MeshBasicMaterial,
	MeshPhongMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	PointLight,
	Scene,
	SphereGeometry,
	SpotLight,
	Vector3,
	WebGL1Renderer
} from 'three';
import type { ColorRepresentation } from 'three';

import { gui } from '@utils/common/gui';

const getBox = (
	x: number,
	y: number,
	z: number,
	color?: ColorRepresentation
) => {
	const geometry = new BoxGeometry(x, y, z);
	const material = new MeshPhongMaterial({ color });
	const mesh = new Mesh(geometry, material);

	mesh.castShadow = true;

	return mesh;
};
const getSphere = (
	radius?: number | undefined,
	widthSegments?: number | undefined,
	heightSegments?: number | undefined,
	color?: ColorRepresentation
) => {
	const geometry = new SphereGeometry(radius, widthSegments, heightSegments);
	const material = new MeshBasicMaterial({ color });
	return new Mesh(geometry, material); // mesh
};

const getPlane = (
	x: number,
	y: number,
	z: number,
	color?: ColorRepresentation
) => {
	const geometry = new PlaneGeometry(x, y, z);
	const material = new MeshPhongMaterial({ color, side: DoubleSide });

	const mesh = new Mesh(geometry, material);

	mesh.receiveShadow = true;

	return mesh;
};

const getPointLight = (color: ColorRepresentation, intensity: number) => {
	const light = new PointLight(color, intensity);
	light.castShadow = true;

	return light;
};
const getSpotLight = (color: ColorRepresentation, intensity: number) => {
	const light = new SpotLight(color, intensity);
	light.castShadow = true;

	return light;
};
const getDirectionalLight = (color: ColorRepresentation, intensity: number) => {
	const light = new DirectionalLight(color, intensity);
	light.castShadow = true;
	light.shadow.camera.left = -10;
	light.shadow.camera.bottom = -10;
	light.shadow.camera.right = 10;
	light.shadow.camera.top = 10;

	return light;
};
const getAmbientLight = (color: ColorRepresentation, intensity: number) => {
	const light = new AmbientLight(color, intensity);

	return light;
};
// const getRectAreaLight = (color: ColorRepresentation, intensity: number) => {
// 	const light = new RectAreaLight(color, intensity);
// 	light.castShadow = true;

// 	return light;
// };

const getBoxGrid = (amount: number, gapMultiplier: number) => {
	const group = new Group();

	let obj1: Mesh<BoxGeometry, MeshPhongMaterial>;
	let obj2: Mesh<BoxGeometry, MeshPhongMaterial>;
	let i = 0;
	let j = 1;
	for (; i < amount; i++) {
		obj1 = getBox(1, 1, 1); // 'rgb(120, 120, 120)'
		obj1.position.x = i * gapMultiplier;
		obj1.position.y = obj1.geometry.parameters.height / 2;
		group.add(obj1);

		j = 1;
		for (; j < amount; j++) {
			obj2 = getBox(1, 1, 1); // 'rgb(120, 120, 120)'
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

const update = (
	render: WebGL1Renderer,
	scene: Scene,
	camera: PerspectiveCamera,
	controls: OrbitControls,
	stats: Stats
) => {
	render.render(scene, camera);

	controls.update();
	stats.update();

	// request Animation frame
	requestAnimationFrame((/* time */) => {
		// console.log('time', time);
		update(render, scene, camera, controls, stats);
	});
};

const init = () => {
	const scene = new Scene();
	let enableFog = false;

	if (enableFog) scene.fog = new FogExp2(0xffffff, 0.2);

	const camera = new PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		1,
		1000
	);
	camera.position.set(1, 2, 5);
	camera.lookAt(new Vector3(0, 0, 0));

	const stats = Stats();
	document.body.appendChild(stats.dom);

	// The director

	// Populating the Scene in three js
	// const mesh = getBox(1, 1, 1, 'rgb(120, 120, 120)');
	// // mesh.position.y = mesh.geometry.parameters.height * 0.5;

	const boxGrid = getBoxGrid(10, 1.5);

	// Creating more geometry objects in three js
	const plane = getPlane(20, 20, 20, 'rgb(120, 120, 120)');
	plane.name = 'plane-1';
	plane.rotation.x = Math.PI / 2;

	const lightsGap = 0.1;

	const sphere1 = getSphere(0.05, 20, 20, 0xffffff);
	const planeLight = getPointLight(0xffffff, 1);
	// planeLight.visible = false;
	planeLight.position.y = 2;
	planeLight.add(sphere1);

	const sphere2 = getSphere(0.05, 20, 20, 0xffffff);
	const spotLight = getSpotLight(0xffffff, 1);
	spotLight.visible = false;
	spotLight.position.y = 2;
	spotLight.position.x =
		planeLight.position.x + sphere1.geometry.parameters.radius * 2 + lightsGap;
	spotLight.add(sphere2);

	const sphere3 = getSphere(0.05, 20, 20, 0xffffff);
	const directionalLight = getDirectionalLight(0xffffff, 1);
	directionalLight.visible = false;
	directionalLight.position.y = 4;
	directionalLight.position.x = 13;
	directionalLight.position.z = 1;
	directionalLight.add(sphere3);

	const sphere4 = getSphere(0.05, 20, 20, 0xffffff);
	sphere4.visible = false;
	const ambientLight = getAmbientLight(0xb2b1a5, 0.5);
	ambientLight.visible = false;
	ambientLight.position.y = 2;
	ambientLight.position.x =
		// directionalLight.position.x +
		// sphere3.geometry.parameters.radius * 2 +
		// lightsGap;
		spotLight.position.x + sphere2.geometry.parameters.radius * 2 + lightsGap;
	ambientLight.add(sphere4);

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
	// scene.add(mesh);
	scene.add(boxGrid);
	scene.add(planeLight);
	scene.add(spotLight);
	scene.add(directionalLight);
	scene.add(ambientLight);
	// scene.add(rectAreaLight);

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

	const render = new WebGL1Renderer({
		canvas,
		antialias: true
	});
	render.setSize(window.innerWidth, window.innerHeight);
	render.shadowMap.enabled = true;

	render.setClearColor('rgb(120, 120, 120)');

	document.body.appendChild(render.domElement);

	const controls = new OrbitControls(camera, render.domElement);

	update(render, scene, camera, controls, stats);
};

init();
