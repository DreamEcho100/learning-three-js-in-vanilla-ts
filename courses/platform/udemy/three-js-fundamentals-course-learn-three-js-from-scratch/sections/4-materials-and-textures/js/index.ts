// import { gui } from '@utils/common/gui';
import { Noise } from 'noisejs';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import {
	Clock,
	CubeTextureLoader,
	DoubleSide,
	Material,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshPhongMaterial,
	MeshStandardMaterial,
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
import type { ColorRepresentation } from 'three';

import { gui } from '../../../../../../../utils/common/gui';

const sphereArrows = {
	up: false,
	right: false,
	down: false,
	left: false
};
const getMaterial = (
	type: 'basic' | 'lambert' | 'phong' | 'standard' = 'basic',
	color: string = 'rgb(255, 255, 255)'
) => {
	const materialOptions = { color, side: DoubleSide };

	const materialsMap = {
		basic: () => new MeshBasicMaterial(materialOptions),
		lambert: () => new MeshLambertMaterial(materialOptions),
		phong: () => new MeshPhongMaterial(materialOptions),
		standard: () => new MeshStandardMaterial(materialOptions)
	};

	return (materialsMap[type] || materialsMap['basic'])();

	// return (() => {
	// 	switch (type) {
	// 		case 'basic':
	// 			return new MeshBasicMaterial(materialOptions);
	// 		case 'lambert':
	// 			return new MeshLambertMaterial(materialOptions);
	// 		case 'phong':
	// 			return new MeshPhongMaterial(materialOptions);
	// 		case 'standard':
	// 			return new MeshStandardMaterial(materialOptions);
	// 		default:
	// 			return new MeshBasicMaterial(materialOptions);
	// 	}
	// })();

	// const selectedMaterial =
	// return selectedMaterial;
};
const getPlane = (
	material: Material,
	width?: number,
	height?: number,
	widthSegments?: number,
	heightSegments?: number
) => {
	const geometry = new PlaneGeometry(
		width,
		height,
		widthSegments,
		heightSegments
	);
	const mesh = new Mesh(geometry, material);
	mesh.receiveShadow = true;

	return mesh;
};

const getSphere = (material: Material, size: number, segments: number) => {
	const geometry = new SphereGeometry(size, segments, segments);
	const obj = new Mesh(geometry, material);
	obj.castShadow = true;

	return obj;
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
	requestAnimationFrame((/* time */) => {
		// console.log('time', time);
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

	const sphereMaterial = getMaterial('phong', 'rgb(255, 255, 255)');
	const sphere = getSphere(sphereMaterial, 1, 24);
	sphere.name = 'mainBall';
	const sphereMaterialImgPath =
		'/img/112-ceppo-di-gre-stone-surface-pbr-texture-seamless-hr.jpg';
	sphereMaterial.map = textureLoader.load(
		'/img/0015-marble-stone-wall-surface-texture-seamless-hr.jpg'
	);

	if ('bumpMap' in sphereMaterial)
		sphereMaterial.bumpMap = textureLoader.load(sphereMaterialImgPath);
	if ('roughnessMap' in sphereMaterial)
		sphereMaterial.bumpMap = textureLoader.load(sphereMaterialImgPath);
	if ('bumpScale' in sphereMaterial) sphereMaterial.bumpScale = 0.01;
	if ('metalness' in sphereMaterial) sphereMaterial.metalness = 0.1;
	if ('roughness' in sphereMaterial) sphereMaterial.roughness = 0.7;

	maps.forEach((value) => {
		if (value in sphereMaterial && sphereMaterial[value]) {
			sphereMaterial[value].wrapS = RepeatWrapping;
			sphereMaterial[value].wrapT = RepeatWrapping;
			sphereMaterial[value].repeat.set(10, 10);
		}
	});

	const planeMaterial = getMaterial('phong', 'rgb(255, 255, 255)');
	const planeMaterialImg1Path =
		'/img/112-ceppo-di-gre-stone-surface-pbr-texture-seamless-hr.jpg';
	const planeMaterialImg2Path = '/img/Concrete_seamless_road_texture3-hr.jpg';
	const planeMaterialImg3Path =
		'/img/0021-stone-wall-surface-texture-seamless-hr.jpg';
	planeMaterial.map = textureLoader.load(planeMaterialImg1Path);

	if ('bumpMap' in planeMaterial)
		planeMaterial.bumpMap = textureLoader.load(planeMaterialImg3Path);
	if ('roughnessMap' in planeMaterial)
		planeMaterial.bumpMap = textureLoader.load(planeMaterialImg2Path);
	if ('bumpScale' in planeMaterial) planeMaterial.bumpScale = 0.01;
	if ('metalness' in planeMaterial) planeMaterial.metalness = 0.05;
	if ('roughness' in planeMaterial) planeMaterial.roughness = 0.05;

	maps.forEach((value) => {
		if (value in planeMaterial) {
			planeMaterial[value].wrapS = RepeatWrapping;
			planeMaterial[value].wrapT = RepeatWrapping;
			planeMaterial[value].repeat.set(10, 10);
		}
	});

	const plane = getPlane(planeMaterial, 40, 40);
	// const plane = getPlane(planeMaterial, 30, 30, 1);

	const lightLeft = getSpotLight('rgb(255, 220, 180)', 1);
	const lightRight = getSpotLight('rgb(255, 220, 180)', 1);

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

	update({ render, scene, camera, controls, stats, clock });
};

init();
