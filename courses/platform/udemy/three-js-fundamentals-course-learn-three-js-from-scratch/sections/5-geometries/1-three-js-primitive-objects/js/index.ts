// import { gui } from '@utils/common/gui';
// import Noise from 'noisejs';
// WebGL
import { gui } from '@utils/common/gui';

import WebGL from 'three/examples/jsm/capabilities/WebGL';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import {
	BoxGeometry,
	Clock,
	ConeGeometry,
	CubeTextureLoader,
	CylinderGeometry,
	DoubleSide,
	Group,
	Material,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshPhongMaterial,
	MeshStandardMaterial,
	Object3D,
	OctahedronGeometry,
	PerspectiveCamera,
	RepeatWrapping,
	RGBFormat,
	Scene,
	SphereGeometry,
	SpotLight,
	TetrahedronGeometry,
	TextureLoader,
	TorusGeometry,
	TorusKnotGeometry,
	Vector3,
	WebGL1Renderer
} from 'three';
import type { ColorRepresentation } from 'three';

const sphereArrows = {
	up: false,
	right: false,
	down: false,
	left: false
};

const GEO_TYPES = [
	'box',
	'cone',
	'cylinder',
	'octahedron',
	'sphere',
	'tetrahedron',
	'torus',
	'torusKnot'
] as const;

const getGeometry = (
	type:
		| 'box'
		| 'cone'
		| 'cylinder'
		| 'octahedron'
		| 'sphere'
		| 'tetrahedron'
		| 'torus'
		| 'torusKnot' = 'box',
	size: number,
	material: Material
) => {
	const segmentMultiplier = 0.5;

	const geometriesMap = {
		box: () => new BoxGeometry(size, size, size),
		cone: () => new ConeGeometry(size, size, 256 * segmentMultiplier),
		cylinder: () => new CylinderGeometry(size, size, 32 * segmentMultiplier),
		octahedron: () => new OctahedronGeometry(size),
		sphere: () =>
			new SphereGeometry(size, 32 * segmentMultiplier, 32 * segmentMultiplier),
		tetrahedron: () => new TetrahedronGeometry(size),
		torus: () =>
			new TorusGeometry(
				size / 2,
				size / 4,
				16 * segmentMultiplier,
				100 * segmentMultiplier
			),
		torusKnot: () =>
			new TorusKnotGeometry(
				size / 2,
				size / 4,
				16 * segmentMultiplier,
				100 * segmentMultiplier
			)
	};

	const mesh = new Mesh(
		(geometriesMap[type] || geometriesMap['box'])(),
		material
	);
	mesh.castShadow = true;
	mesh.name = type;

	return mesh;
};

const getMaterial = (
	type: 'basic' | 'lambert' | 'phong' | 'standard' = 'basic',
	color: string = 'rgb(255, 255, 255)'
) => {
	const materialOptions = { color, side: DoubleSide, wireframe: true };

	const materialsMap = {
		basic: () => new MeshBasicMaterial(materialOptions),
		lambert: () => new MeshLambertMaterial(materialOptions),
		phong: () => new MeshPhongMaterial(materialOptions),
		standard: () => new MeshStandardMaterial(materialOptions)
	};

	return (materialsMap[type] || materialsMap['basic'])();
};

const getSpotLight = (color?: ColorRepresentation, intensity?: number) => {
	const light = new SpotLight(color, intensity);
	light.castShadow = true;
	light.penumbra = 0.5;

	light.shadow.mapSize.width = 2048;
	light.shadow.mapSize.height = 2048;
	light.shadow.bias = 0.001;

	return light;
};

const update = (props: {
	render: WebGL1Renderer;
	scene: Scene;
	camera: PerspectiveCamera;
	controls: OrbitControls;
	stats: Stats;
	clock: Clock;
}) => {
	props.render.render(props.scene, props.camera);

	props.controls.update();
	props.stats.update();

	const sceneCameraGroup = props.scene.getObjectByName(
		'sceneCameraGroup'
	) as Group;

	sceneCameraGroup.rotateY(Math.PI * 0.001);

	// const timeElapsed = props.clock.getElapsedTime();

	// request Animation frame
	requestAnimationFrame((/* time */) => {
		// console.log('time', time);
		update(props);
	});
};

const init = () => {
	const scene = new Scene();

	// initialize objects
	const objectMaterial = getMaterial('standard', 'rgb(255, 255, 255)');
	const geoTypes = GEO_TYPES;

	const geos = geoTypes.map((type) => {
		return getGeometry(type, 5, objectMaterial); // const geo =
	});
	scene.add(...geos);

	console.log('geos', geos);
	let geoActiveIndex = 0;
	const handleGeos = () => {
		geos.forEach((geo, geoIndex) => {
			if (geoIndex === geoActiveIndex) return geo.scale.set(1, 1, 1);
			geo.scale.set(0, 0, 0);
		});

		if (geoActiveIndex + 1 === geoTypes.length) return (geoActiveIndex = 0);
		geoActiveIndex++;
	};

	handleGeos();

	setInterval(() => {
		handleGeos();
	}, 1000);

	const bgImgsBasePath = '/img/SwedishRoyalCastle/';
	const bgImgsFormat = '.jpg';

	const bgImgsUrl = ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map(
		(item) => bgImgsBasePath + item + bgImgsFormat
	);
	const reflectionCube = new CubeTextureLoader().load(bgImgsUrl);
	reflectionCube.format = RGBFormat;
	scene.background = reflectionCube;

	// Manipulate material
	const textureLoader = new TextureLoader();
	const maps = ['bumpMap', 'roughnessMap'];
	const imgPath1 =
		'/img/112-ceppo-di-gre-stone-surface-pbr-texture-seamless-hr.jpg';
	const imgPath2 =
		'/img/0015-marble-stone-wall-surface-texture-seamless-hr.jpg';
	objectMaterial;

	// const sphereMaterial = getMaterial('standard', 'rgb(255, 255, 255)');
	// const sphere = getSphere(sphereMaterial, 1, 24);
	// sphere.name = 'mainBall';
	objectMaterial.map = textureLoader.load(imgPath2);

	if ('bumpMap' in objectMaterial)
		objectMaterial.bumpMap = textureLoader.load(imgPath1);
	if ('roughnessMap' in objectMaterial)
		objectMaterial.roughnessMap = textureLoader.load(imgPath1);

	if ('bumpScale' in objectMaterial) objectMaterial.bumpScale = 0.01;
	if ('roughness' in objectMaterial) objectMaterial.roughness = 0.5;
	if ('metalness' in objectMaterial) objectMaterial.metalness = 0.7;

	maps.forEach((value) => {
		if (Object.hasOwn(objectMaterial, value)) {
			(objectMaterial as Record<string, any>)[value].wrapS = RepeatWrapping;
			(objectMaterial as Record<string, any>)[value].wrapT = RepeatWrapping;
			(objectMaterial as Record<string, any>)[value].repeat.set(1, 1);
		}
	});

	// const planeMaterialImg1Path =
	// 	'/img/112-ceppo-di-gre-stone-surface-pbr-texture-seamless-hr.jpg';
	// const planeMaterialImg2Path = '/img/Concrete_seamless_road_texture3-hr.jpg';
	// const planeMaterialImg3Path =
	// 	'/img/0021-stone-wall-surface-texture-seamless-hr.jpg';
	// planeMaterial.map = textureLoader.load(planeMaterialImg1Path);

	// if ('bumpMap' in planeMaterial)
	// 	planeMaterial.bumpMap = textureLoader.load(planeMaterialImg3Path);
	// if ('roughnessMap' in planeMaterial)
	// 	planeMaterial.bumpMap = textureLoader.load(planeMaterialImg2Path);
	// if ('bumpScale' in planeMaterial) planeMaterial.bumpScale = 0.01;
	// if ('metalness' in planeMaterial) planeMaterial.metalness = 0.05;
	// if ('roughness' in planeMaterial) planeMaterial.roughness = 0.05;

	// maps.forEach((value) => {
	// 	if (Object.hasOwn(planeMaterial, value)) {
	// 		(planeMaterial as Record<string, any>)[value].wrapS = RepeatWrapping;
	// 		(planeMaterial as Record<string, any>)[value].wrapT = RepeatWrapping;
	// 		(planeMaterial as Record<string, any>)[value].repeat.set(10, 10);
	// 	}
	// });

	// const plane = getPlane(planeMaterial, 30, 30, 1);

	const lightLeft = getSpotLight('rgb(255, 220, 180)', 1);
	const lightRight = getSpotLight('rgb(255, 220, 180)', 1);
	const lightBottom = getSpotLight('rgb(255, 220, 180)', 0.33);

	lightLeft.position.set(-5, 2, -4);
	lightRight.position.set(5, 2, -4);
	lightBottom.position.set(5, 2, -4);
	{
		const lightLeftFolder = gui.addFolder({
			title: 'Light Left'
		});
		lightLeftFolder.addInput(lightLeft, 'intensity', {
			min: 0,
			max: 10,
			step: 0.1
		});
		lightLeftFolder.addInput(lightLeft.position, 'x', {
			min: -5,
			max: 15,
			step: 0.1
		});
		lightLeftFolder.addInput(lightLeft.position, 'y', {
			min: -5,
			max: 15,
			step: 0.1
		});
		lightLeftFolder.addInput(lightLeft.position, 'z', {
			min: -5,
			max: 15,
			step: 0.1
		});
	}
	{
		const lightRightFolder = gui.addFolder({
			title: 'Light Right',
			expanded: false
		});
		lightRightFolder.addInput(lightRight, 'intensity', {
			min: 0,
			max: 10,
			step: 0.1
		});
		lightRightFolder.addInput(lightRight.position, 'x', {
			min: -5,
			max: 15,
			step: 0.1
		});
		lightRightFolder.addInput(lightRight.position, 'y', {
			min: -5,
			max: 15,
			step: 0.1
		});
		lightRightFolder.addInput(lightRight.position, 'z', {
			min: -5,
			max: 15,
			step: 0.1
		});
	}
	{
		const lightBottomFolder = gui.addFolder({
			title: 'Light Bottom',
			expanded: false
		});
		lightBottomFolder.addInput(lightBottom, 'intensity', {
			min: 0,
			max: 10,
			step: 0.1
		});
		lightBottomFolder.addInput(lightBottom.position, 'x', {
			min: -5,
			max: 15,
			step: 0.1
		});
		lightBottomFolder.addInput(lightBottom.position, 'y', {
			min: -5,
			max: 15,
			step: 0.1
		});
		lightBottomFolder.addInput(lightBottom.position, 'z', {
			min: -5,
			max: 15,
			step: 0.1
		});
	}

	// scene.add(sphere);
	scene.add(lightLeft);
	scene.add(lightRight);
	scene.add(lightBottom);

	window.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowUp') sphereArrows.up = true;
		if (event.key === 'ArrowRight') sphereArrows.right = true;
		if (event.key === 'ArrowDown') sphereArrows.down = true;
		if (event.key === 'ArrowLeft') sphereArrows.left = true;
	});
	window.addEventListener('keyup', (event) => {
		if (event.key === 'ArrowUp') sphereArrows.up = false;
		if (event.key === 'ArrowRight') sphereArrows.right = false;
		if (event.key === 'ArrowDown') sphereArrows.down = false;
		if (event.key === 'ArrowLeft') sphereArrows.left = false;
	});

	const cameraGroup = new Group();
	const camera = new PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		1,
		1000
	);

	camera.position.set(20, 0, 5);
	camera.lookAt(new Vector3(0, 0, 0));
	cameraGroup.add(camera);
	cameraGroup.name = 'sceneCameraGroup';
	scene.add(cameraGroup);

	const canvas = document.getElementById('webgl');
	if (!canvas) throw new Error('Can not find canvas');

	const render = new WebGL1Renderer({
		canvas,
		antialias: true
	});
	render.setSize(window.innerWidth, window.innerHeight);
	render.shadowMap.enabled = true;

	render.setClearColor('rgb(0, 0, 0)');

	const controls = new OrbitControls(camera, render.domElement);
	const stats = Stats();
	const clock = new Clock();

	document.body.appendChild(render.domElement);
	document.body.appendChild(stats.dom);
	if (WebGL.isWebGLAvailable()) {
		// Initiate function or other initializations here
		update({ render, scene, camera, controls, stats, clock });
		// animate();
	} else {
		const warning = WebGL.getWebGLErrorMessage();
		alert(warning.textContent);
		// document.getElementById( 'container' ).appendChild( warning );
	}
};

init();
