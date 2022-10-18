import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	Clock,
	DoubleSide,
	MeshBasicMaterial,
	PerspectiveCamera,
	Points,
	PointsMaterial,
	Scene,
	TextureLoader,
	Vector3,
	WebGL1Renderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import WebGL from 'three/examples/jsm/capabilities/WebGL';

import {
	getPlane,
	handleKeepPerspectiveCameraAspectRatioOnResize
} from '../../utils';

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

	// const timeElapsed = props.clock.getElapsedTime();
	const particleSystem = props.scene.getObjectByName(
		'particleSystem'
	) as unknown as Points<BufferGeometry, PointsMaterial>;
	const positionAttribute = particleSystem.geometry.getAttribute('position');
	// particleSystem.rotation.x += Math.PI * 0.001;
	let i = 0;
	let particlePosX: number;
	let particlePosY: number;
	// let particlePosZ: number;
	for (; i < positionAttribute.count; i++) {
		// positionAttribute.setZ(
		// 	i,
		// 	positionAttribute.getZ(i) + Math.sin(timeElapsed + i + 0.01) * 0.005
		// );
		particlePosX = positionAttribute.getX(i);
		particlePosY = positionAttribute.getY(i);
		// particlePosZ = positionAttribute.getZ(i);
		positionAttribute.setXY(
			i,
			particlePosX < -15 ? 15 : particlePosX + (Math.random() - 1) * 0.1,
			particlePosY < -15
				? 15
				: positionAttribute.getY(i) + (Math.random() - 0.75) * 0.1
			// particlePosZ > 0 ? -10 : positionAttribute.getZ(i) + Math.random() * 0.1
		);
	}
	particleSystem.geometry.attributes.position.needsUpdate = true;

	requestAnimationFrame(() => {
		update(props);
	});
};

const init = () => {
	const scene = new Scene();

	const camera = new PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		1,
		1000
	);
	camera.position.set(0, 0, 10);
	camera.lookAt(new Vector3(0, 0, 0));

	// The director

	// Creating more geometry objects in three js
	const plane = getPlane(
		{ width: 20, height: 20 },
		new MeshBasicMaterial({
			color: 0x3f9090,
			side: DoubleSide
		}),
		(plane) => {
			plane.name = 'plane-1';
			plane.rotation.x = Math.PI * 0.6;
			// plane.rotation.y = Math.PI * 0;
			// plane.translateX(-2);
			plane.position.x -= 2;
			plane.rotation.z = Math.PI * -0.1;
		}
	);

	// https://threejs.org/docs/#api/en/core/BufferGeometry

	const particleGeoVertices: number[] = [];
	const particleGeoVertices32 = new Float32Array(3000);
	const particleGeo = new BufferGeometry();

	const particleMaterial = new PointsMaterial({
		color: 'rgb(255, 255, 255)',
		size: 1,
		map: new TextureLoader().load('/img/particle.jpg'),
		transparent: true,
		blending: AdditiveBlending,
		depthWrite: false
	});
	const particleCount = 1000;
	const particleDistance = 30;

	let i = 0;
	for (; i < particleCount; i++) {
		particleGeoVertices.push(
			(Math.random() - 0.5) * particleDistance,
			(Math.random() - 0.5) * particleDistance,
			(Math.random() - 0.5) * particleDistance
		);
	}
	particleGeoVertices32.set(particleGeoVertices);

	particleGeo.setAttribute(
		'position',
		new BufferAttribute(particleGeoVertices32, 3)
	);

	const particleSystem = new Points(particleGeo, particleMaterial);
	particleSystem.name = 'particleSystem';

	scene.add(particleSystem);
	scene.add(plane);

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
