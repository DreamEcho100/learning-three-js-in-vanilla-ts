// import Noise from 'noisejs';
// WebGL
import { gui } from '@utils/common/gui';

import WebGL from 'three/examples/jsm/capabilities/WebGL';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import {
	Clock,
	DoubleSide,
	Group,
	Material,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshPhongMaterial,
	MeshStandardMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	SpotLight,
	Vector3,
	WebGL1Renderer
} from 'three';
import type { ColorRepresentation } from 'three';

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
	material.side = DoubleSide;
	const mesh = new Mesh(geometry, material);
	mesh.receiveShadow = true;
	mesh.castShadow = true;

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

	const timeElapsed = props.clock.getElapsedTime();

	const plane = props.scene.getObjectByName('plane-1') as unknown as Mesh<
		PlaneGeometry,
		Material
	>;

	// plane.geometry.vertices.map(vertices => {
	//   vertices.z = 0.42 * Math.sin(vertices.x * 2 + time);
	// });

	// plane.geometry.verticesNeedUpdate = true;

	// const positionAttribute = plane.geometry.getAttribute('position');
	// const positionAttributeArray = positionAttribute.array

	// for (var i = 0, j = this.particles.geometry.vertices.length; i < j; i++) {
	//       var particle:any = this.particles.geometry.vertices[i];
	//       particle.x += (particle.destination.x - particle.x) * particle.speed;
	//       particle.y += (particle.destination.y - particle.y) * particle.speed;
	//       particle.z += (particle.destination.z - particle.z) * particle.speed;
	//   }

	const positionAttribute = plane.geometry.getAttribute('position');
	let i = 0;
	for (; i < positionAttribute.count; i++) {
		// vertex.fromBufferAttribute(positionAttribute, i);

		//
		// const waveX1 =
		// 	0.25 * Math.sin(positionAttribute.getX(i) * 2 + timeElapsed * 3);
		// const waveX2 =
		// 	0.125 * Math.sin(positionAttribute.getX(i) * 3 + timeElapsed * 2);
		// const waveY1 =
		// 	0.1 * Math.sin(positionAttribute.getY(i) * 5 + timeElapsed * 0.5);

		// positionAttribute.setZ(
		// 	i,
		// 	positionAttribute.getZ(i) + waveX1 + waveX2 + waveY1
		// );

		// positionAttribute.setZ(i, vertex.z);
		// plane.geometry.attributes.position.setZ(
		// 	i,
		// 	0.42 *
		// 		Math.sin(plane.geometry.attributes.position.getX(i) * 2 + timeElapsed)
		// );

		//
		positionAttribute.setZ(
			i,
			positionAttribute.getZ(i) + Math.sin(timeElapsed + i + 0.01) * 0.005
		);
		plane.geometry.attributes.position.needsUpdate = true;
	}

	// sceneCameraGroup.rotateY(Math.PI * 0.001);

	// request Animation frame
	requestAnimationFrame((/* time */) => {
		// console.log('time', time);
		update(props);
	});
};

const init = () => {
	const scene = new Scene();

	const planeMaterial = getMaterial('basic', 'rgb(255, 255, 255)');
	const plane = getPlane(planeMaterial, 30, 60, 40, 40);

	plane.rotation.x = Math.PI * 0.5;
	// plane.rotation.y = Math.PI * 0.5;
	plane.name = 'plane-1';

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

	scene.add(plane);
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

	camera.position.set(-5, 5, 60);
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