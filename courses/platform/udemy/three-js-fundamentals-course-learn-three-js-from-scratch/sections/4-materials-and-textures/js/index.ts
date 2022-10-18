import { gui } from '@utils/common/gui';

import WebGL from 'three/examples/jsm/capabilities/WebGL';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import {
	Clock,
	CubeTextureLoader,
	DoubleSide,
	Material,
	Mesh,
	PerspectiveCamera,
	PlaneGeometry,
	RepeatWrapping,
	RGBFormat,
	Scene,
	SphereGeometry,
	SpotLight,
	TextureLoader,
	Vector3,
	WebGL1Renderer
} from 'three';

import {
	getMaterial,
	getPlane,
	getSphere,
	getSpotLight,
	handleKeepPerspectiveCameraAspectRatioOnResize
} from '@utils/common/threejs';

const sphereArrows = {
	up: false,
	right: false,
	down: false,
	left: false
};

const sphereHandler = (material: Mesh<SphereGeometry, Material>) => {
	material.castShadow = true;
	return material;
};
const planeHandler = (material: Mesh<PlaneGeometry, Material>) => {
	material.castShadow = true;
	return material;
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

	const sphere = props.scene.getObjectByName('mainBall') as Mesh<
		SphereGeometry,
		Material
	>;

	if (sphereArrows.up) {
		sphereArrows.up = true;
		sphere.position.z -= 0.1;
		sphere.rotateX(Math.PI * -0.01);
	}
	if (sphereArrows.right) {
		sphereArrows.right = true;
		sphere.position.x += 0.1;
		sphere.rotateZ(Math.PI * -0.01);
	}
	if (sphereArrows.down) {
		sphereArrows.down = true;
		sphere.position.z += 0.1;
		sphere.rotateX(Math.PI * 0.01);
	}
	if (sphereArrows.left) {
		sphereArrows.left = true;
		sphere.position.x -= 0.1;
		sphere.rotateZ(Math.PI * 0.01);
	}

	// const timeElapsed = props.clock.getElapsedTime();

	// request Animation frame
	requestAnimationFrame(() => {
		update(props);
	});
};

const init = () => {
	const scene = new Scene();

	const bgImgsBasePath = '/img/SwedishRoyalCastle/';
	const bgImgsFormat = '.jpg';

	const bgImgsUrl = ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map(
		(item) => bgImgsBasePath + item + bgImgsFormat
	);
	const reflectionCube = new CubeTextureLoader().load(bgImgsUrl);
	reflectionCube.format = RGBFormat;
	scene.background = reflectionCube;

	const textureLoader = new TextureLoader();
	const maps = ['map', 'bumpMap', 'roughnessMap'] as const;

	const sphereMaterial = getMaterial('phong', {
		color: 'rgb(255, 255, 255)',
		side: DoubleSide
	});
	const sphere = sphereHandler(
		getSphere({ radius: 1, widthSegments: 24 }, sphereMaterial)
	);
	sphere.name = 'mainBall';
	const sphereMaterialImgPath =
		'/img/112-ceppo-di-gre-stone-surface-pbr-texture-seamless-hr.jpg';
	sphereMaterial.map = textureLoader.load(
		'/img/0015-marble-stone-wall-surface-texture-seamless-hr.jpg'
	);

	if ('bumpMap' in sphereMaterial)
		sphereMaterial.bumpMap = textureLoader.load(sphereMaterialImgPath);
	if ('roughnessMap' in sphereMaterial)
		sphereMaterial.roughnessMap = textureLoader.load(sphereMaterialImgPath);
	if ('bumpScale' in sphereMaterial) sphereMaterial.bumpScale = 0.01;
	if ('metalness' in sphereMaterial) sphereMaterial.metalness = 0.1;
	if ('roughness' in sphereMaterial) sphereMaterial.roughness = 0.7;

	maps.forEach((value) => {
		if (Object.hasOwn(sphereMaterial, value)) {
			(sphereMaterial as Record<string, any>)[value].wrapS = RepeatWrapping;
			(sphereMaterial as Record<string, any>)[value].wrapT = RepeatWrapping;
			(sphereMaterial as Record<string, any>)[value].repeat.set(10, 10);
		}
	});

	const planeMaterial = getMaterial('phong', {
		color: 'rgb(255, 255, 255)',
		side: DoubleSide
	});
	const planeMaterialImg1Path =
		'/img/112-ceppo-di-gre-stone-surface-pbr-texture-seamless-hr.jpg';
	// const planeMaterialImg2Path = '/img/Concrete_seamless_road_texture3-hr.jpg';
	const planeMaterialImg3Path =
		'/img/0021-stone-wall-surface-texture-seamless-hr.jpg';
	planeMaterial.map = textureLoader.load(planeMaterialImg1Path);

	if ('bumpMap' in planeMaterial)
		planeMaterial.bumpMap = textureLoader.load(planeMaterialImg3Path);
	if ('roughnessMap' in planeMaterial)
		planeMaterial.roughnessMap = textureLoader.load(planeMaterialImg3Path);
	if ('bumpScale' in planeMaterial) planeMaterial.bumpScale = 0.01;
	if ('metalness' in planeMaterial) planeMaterial.metalness = 0.05;
	if ('roughness' in planeMaterial) planeMaterial.roughness = 0.05;

	maps.forEach((value) => {
		if (Object.hasOwn(planeMaterial, value)) {
			(planeMaterial as Record<string, any>)[value].wrapS = RepeatWrapping;
			(planeMaterial as Record<string, any>)[value].wrapT = RepeatWrapping;
			(planeMaterial as Record<string, any>)[value].repeat.set(10, 10);
		}
	});

	const plane = planeHandler(
		getPlane({ width: 40, height: 40 }, planeMaterial)
	);
	// const plane = getPlane(planeMaterial, 30, 30, 1);

	const lightLeft = spotLightHandler(
		getSpotLight({ color: 'rgb(255, 220, 180)', intensity: 1 })
	);
	const lightRight = spotLightHandler(
		getSpotLight({ color: 'rgb(255, 220, 180)', intensity: 1 })
	);

	// manipulate objects
	sphere.position.y = sphere.geometry.parameters.radius;
	plane.rotation.x = Math.PI * 0.5;

	lightLeft.position.set(-5, 2, -4);
	lightRight.position.set(5, 2, -4);
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
		const sphereMaterialFolder = gui.addFolder({
			title: 'Sphere Material',
			expanded: false
		});
		if ('shininess' in sphereMaterial) {
			sphereMaterialFolder.addInput(sphereMaterial, 'shininess', {
				min: 0,
				max: 1000,
				step: 0.1
			});
		}
		if ('roughness' in sphereMaterial) {
			sphereMaterialFolder.addInput(sphereMaterial, 'roughness', {
				min: 0,
				max: 2,
				step: 0.1
			});
		}
		if ('metalness' in sphereMaterial) {
			sphereMaterialFolder.addInput(sphereMaterial, 'metalness', {
				min: 0,
				max: 2,
				step: 0.1
			});
		}
	}
	{
		const planeMaterialFolder = gui.addFolder({
			title: 'Plane Material',
			expanded: false
		});
		if ('shininess' in planeMaterial) {
			planeMaterialFolder.addInput(planeMaterial, 'shininess', {
				min: 0,
				max: 1000,
				step: 0.1
			});
		}
		if ('roughness' in planeMaterial) {
			planeMaterialFolder.addInput(planeMaterial, 'roughness', {
				min: 0,
				max: 2,
				step: 0.1
			});
		}
		if ('metalness' in planeMaterial) {
			planeMaterialFolder.addInput(planeMaterial, 'metalness', {
				min: 0,
				max: 2,
				step: 0.1
			});
		}
	}

	scene.add(sphere);
	scene.add(plane);
	scene.add(lightLeft);
	scene.add(lightRight);

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

	const camera = new PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		1,
		1000
	);

	camera.position.set(-2, 7, 7);
	camera.lookAt(new Vector3(0, 0, 0));

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
