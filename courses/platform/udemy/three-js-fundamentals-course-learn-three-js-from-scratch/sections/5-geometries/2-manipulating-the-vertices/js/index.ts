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
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	SpotLight,
	Vector3,
	WebGL1Renderer
} from 'three';

import {
	getMaterial,
	getPlane,
	getSpotLight,
	handleKeepPerspectiveCameraAspectRatioOnResize
} from '../../../utils';

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
	}
	plane.geometry.attributes.position.needsUpdate = true;

	// sceneCameraGroup.rotateY(Math.PI * 0.001);

	// request Animation frame
	requestAnimationFrame(() => {
		update(props);
	});
};

const init = () => {
	const scene = new Scene();

	const planeMaterial = getMaterial(
		'basic',
		{
			color: 'rgb(255, 255, 255)',
			side: DoubleSide,
			wireframe: true
		},
		(material) => {
			material.side = DoubleSide;
		}
	);
	const plane = getPlane(
		{ width: 30, height: 60, widthSegments: 40, heightSegments: 40 },
		planeMaterial
	);

	plane.rotation.x = Math.PI * 0.5;
	// plane.rotation.y = Math.PI * 0.5;
	plane.name = 'plane-1';

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
