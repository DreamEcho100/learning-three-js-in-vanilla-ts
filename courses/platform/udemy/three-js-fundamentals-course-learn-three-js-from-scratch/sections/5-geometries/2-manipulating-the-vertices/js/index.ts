// import Noise from 'noisejs';
// WebGL
import { gui } from '@utils/common/gui';

import WebGL from 'three/examples/jsm/capabilities/WebGL';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import {
	Clock,
	// DoubleSide,
	Group,
	// Material,
	// Mesh,
	// MeshBasicMaterial,
	// MeshLambertMaterial,
	// MeshPhongMaterial,
	// MeshStandardMaterial,
	PerspectiveCamera,
	// PlaneGeometry,
	Scene,
	SpotLight,
	Vector3,
	WebGL1Renderer
} from 'three';
import type { ColorRepresentation } from 'three';

// const getPlane = (
// 	material: Material,
// 	width?: number,
// 	height?: number,
// 	widthSegments?: number,
// 	heightSegments?: number
// ) => {
// 	const geometry = new PlaneGeometry(
// 		width,
// 		height,
// 		widthSegments,
// 		heightSegments
// 	);
// 	const mesh = new Mesh(geometry, material);
// 	mesh.receiveShadow = true;

// 	return mesh;
// };

// const getMaterial = (
// 	type: 'basic' | 'lambert' | 'phong' | 'standard' = 'basic',
// 	color: string = 'rgb(255, 255, 255)'
// ) => {
// 	const materialOptions = { color, side: DoubleSide, wireframe: true };

// 	const materialsMap = {
// 		basic: () => new MeshBasicMaterial(materialOptions),
// 		lambert: () => new MeshLambertMaterial(materialOptions),
// 		phong: () => new MeshPhongMaterial(materialOptions),
// 		standard: () => new MeshStandardMaterial(materialOptions)
// 	};

// 	return (materialsMap[type] || materialsMap['basic'])();
// };

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
