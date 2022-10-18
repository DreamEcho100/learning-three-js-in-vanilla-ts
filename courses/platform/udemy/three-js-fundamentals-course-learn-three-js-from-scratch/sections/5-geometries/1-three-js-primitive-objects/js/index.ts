// import Noise from 'noisejs';

import { gui } from '@utils/common/tweakpaneGUI';

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

import {
	getMaterial,
	getSpotLight,
	handleKeepPerspectiveCameraAspectRatioOnResize
} from '@utils/common/three';

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

const spotLightHandler = (light: SpotLight) => {
	light.castShadow = true;
	light.penumbra = 0.5;

	light.shadow.mapSize.width = 2048;
	light.shadow.mapSize.height = 2048;
	light.shadow.bias = 0.001;

	return light;
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

	const sceneCameraGroup = props.scene.getObjectByName(
		'sceneCameraGroup'
	) as Group;

	sceneCameraGroup.rotateY(Math.PI * 0.0005);

	// const timeElapsed = props.clock.getElapsedTime();

	// request Animation frame
	requestAnimationFrame(() => {
		update(props);
	});
};

const init = () => {
	const scene = new Scene();

	// initialize objects
	const objectMaterial = getMaterial('standard', {
		color: 'rgb(255, 255, 255)',
		side: DoubleSide,
		wireframe: true
	});
	const geoTypes = GEO_TYPES;

	const geos = geoTypes.map((type) => {
		return getGeometry(type, 5, objectMaterial); // const geo =
	});
	scene.add(...geos);

	console.log('geos', geos);
	let geoActiveIndex = 0;
	const handleGeos = () => {
		geos.forEach((geo, geoIndex) => {
			if (geoIndex === geoActiveIndex) {
				geo.scale.set(1, 1, 1);
				return;
			}
			geo.scale.set(0, 0, 0);
		});

		if (geoActiveIndex + 1 === geoTypes.length) {
			geoActiveIndex = 0;
			return;
		}
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

	const lightLeft = spotLightHandler(
		getSpotLight({ color: 'rgb(255, 220, 180)', intensity: 1 })
	);
	const lightRight = spotLightHandler(
		getSpotLight({ color: 'rgb(255, 220, 180)', intensity: 1 })
	);
	const lightBottom = spotLightHandler(
		getSpotLight({ color: 'rgb(255, 220, 180)', intensity: 0.33 })
	);

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

	const renderer = new WebGL1Renderer({
		canvas,
		antialias: true
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;

	renderer.setClearColor('rgb(0, 0, 0)');

	const controls = new OrbitControls(camera, renderer.domElement);
	const stats = Stats();
	const clock = new Clock();

	document.body.appendChild(renderer.domElement);
	document.body.appendChild(stats.dom);
	if (WebGL.isWebGLAvailable()) {
		handleKeepPerspectiveCameraAspectRatioOnResize({ camera, scene, renderer });
		update({ renderer, scene, camera, controls, stats, clock });
	} else {
		const warning = WebGL.getWebGLErrorMessage();
		alert(warning.textContent);
	}
};

init();
