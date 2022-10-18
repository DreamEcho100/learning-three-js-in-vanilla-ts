import {
	SpotLight,
	DoubleSide,
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshPhongMaterial,
	MeshStandardMaterial,
	Material,
	Mesh,
	PlaneGeometry,
	SphereGeometry,
	AmbientLight,
	Color,
	DirectionalLight,
	PointLight,
	Light,
	BoxGeometry,
	PerspectiveCamera,
	Scene,
	WebGL1Renderer
} from 'three';

type TColorRepresentation = string | number | Color; // ColorRepresentation

// type TGetMaterialBase<T, R> = (type: T, color?: string) => R;
// type TGetMaterial =
// 	| TGetMaterialBase<typeof EGetMaterialBase['basic'], MeshBasicMaterial>
// 	| TGetMaterialBase<typeof EGetMaterialBase['lambert'], MeshLambertMaterial>
// 	| TGetMaterialBase<typeof EGetMaterialBase['phong'], MeshPhongMaterial>
// 	| TGetMaterialBase<typeof EGetMaterialBase['standard'], MeshStandardMaterial>;
// interface IGetMaterial {
// 	basic: TGetMaterialBase<typeof EGetMaterialBase['basic'], MeshBasicMaterial>;
// 	lambert: TGetMaterialBase<
// 		typeof EGetMaterialBase['lambert'],
// 		MeshLambertMaterial
// 	>;
// 	phong: TGetMaterialBase<typeof EGetMaterialBase['phong'], MeshPhongMaterial>;
// 	standard: TGetMaterialBase<
// 		typeof EGetMaterialBase['standard'],
// 		MeshStandardMaterial
// 	>;
// }

// function getMaterial(type?: EGetMaterialBase.basic, color?: string): MeshBasicMaterial;
// function getMaterial(type: EGetMaterialBase.lambert, color?: string): MeshLambertMaterial;
// function getMaterial(type: EGetMaterialBase.phong, color?: string): MeshPhongMaterial;
// function getMaterial(type: EGetMaterialBase.standard, color?: string): MeshStandardMaterial;
enum EGetMaterialBase {
	basic = 'basic',
	lambert = 'lambert',
	phong = 'phong',
	standard = 'standard'
}
export const getMaterial = (
	type: 'basic' | 'lambert' | 'phong' | 'standard' = 'basic',
	materialOptions: {
		color?: string | number;
		wireframe?: boolean;
		side?: typeof DoubleSide;
	},
	middleware?: (
		material:
			| MeshPhongMaterial
			| MeshBasicMaterial
			| MeshLambertMaterial
			| MeshStandardMaterial
	) => void
) => {
	const materialsMap = {
		[EGetMaterialBase.basic]: () => new MeshBasicMaterial(materialOptions),
		[EGetMaterialBase.lambert]: () => new MeshLambertMaterial(materialOptions),
		[EGetMaterialBase.phong]: () => new MeshPhongMaterial(materialOptions),
		[EGetMaterialBase.standard]: () => new MeshStandardMaterial(materialOptions)
	};

	const material = (materialsMap[type] || materialsMap['basic'])();
	middleware && middleware(material);

	return material;
};

export const getSpotLight = (
	options: Partial<Omit<SpotLight, 'color'> & { color: TColorRepresentation }>,
	middleware?: (ambientLight: SpotLight) => void
) => {
	const light = new SpotLight(
		options.color,
		options.intensity,
		options.distance,
		options.angle,
		options.penumbra,
		options.decay
	);

	middleware && middleware(light);

	return light;
};

export const getAmbientLight = (
	options: Partial<
		Omit<AmbientLight, 'color'> & { color: TColorRepresentation }
	>,
	middleware?: (ambientLight: AmbientLight) => void
) => {
	const light = new AmbientLight(options.color, options.intensity);

	middleware && middleware(light);

	return light;
};
export const getPointLight = (
	options: Partial<Omit<PointLight, 'color'> & { color: TColorRepresentation }>,
	middleware?: (ambientLight: PointLight) => void
) => {
	const light = new PointLight(options.color, options.intensity);

	middleware && middleware(light);

	return light;
};
export const getLight = (
	options: Partial<Omit<Light, 'hex'> & { color: string | number }>,
	middleware?: (ambientLight: Light) => void
) => {
	const light = new Light(options.color, options.intensity);

	middleware && middleware(light);

	return light;
};

export const getDirectionalLight = (
	options: Partial<
		Omit<DirectionalLight, 'color'> & { color: TColorRepresentation }
	>,
	middleware?: (directionalLight: DirectionalLight) => void
) => {
	const light = new DirectionalLight(options.color, options.intensity);

	middleware && middleware(light);

	return light;
};

export const getSphere = (
	options: Partial<SphereGeometry['parameters']>,
	material: Material | ReturnType<typeof getMaterial>,
	materialMiddleware?: (material: Material) => Material
) => {
	const geometry = new SphereGeometry(
		options.radius,
		options.widthSegments,
		options.heightSegments,
		options.phiStart,
		options.phiLength,
		options.thetaStart,
		options.thetaLength
	);
	const mesh = new Mesh(
		geometry,
		materialMiddleware ? materialMiddleware(material) : material
	);

	return mesh;
};

export const getPlane = <T extends Material | Material[]>(
	planeOptions: Partial<PlaneGeometry['parameters']>,
	material: T,
	middleware?: (plane: Mesh<PlaneGeometry, T>) => void // Mesh<PlaneGeometry, Material>
) => {
	const geometry = new PlaneGeometry(
		planeOptions.width,
		planeOptions.height,
		planeOptions.widthSegments,
		planeOptions.heightSegments
	);
	const mesh = new Mesh(geometry, material);

	middleware && middleware(mesh);

	return mesh;
};

export const getBox = <T extends Material | Material[]>(
	planeOptions: Partial<PlaneGeometry['parameters']>,
	material: T,
	materialMiddleware?: (material: T) => T
) => {
	const geometry = new BoxGeometry(
		planeOptions.width,
		planeOptions.height,
		planeOptions.widthSegments,
		planeOptions.heightSegments
	);
	const mesh = new Mesh(
		geometry,
		materialMiddleware ? materialMiddleware(material) : material
	); //  as Mesh<BoxGeometry, T>;

	return mesh;
};
// // !!!
// const getGeometry = (
// 	type:
// 		| 'box'
// 		| 'cone'
// 		| 'cylinder'
// 		| 'octahedron'
// 		| 'sphere'
// 		| 'tetrahedron'
// 		| 'torus'
// 		| 'torusKnot' = 'box',
// 	size: number,
// 	material: Material
// ) => {
// 	const segmentMultiplier = 0.5;

// 	const geometriesMap = {
// 		box: () => new BoxGeometry(size, size, size),
// 		cone: () => new ConeGeometry(size, size, 256 * segmentMultiplier),
// 		cylinder: () => new CylinderGeometry(size, size, 32 * segmentMultiplier),
// 		octahedron: () => new OctahedronGeometry(size),
// 		sphere: () =>
// 			new SphereGeometry(size, 32 * segmentMultiplier, 32 * segmentMultiplier),
// 		tetrahedron: () => new TetrahedronGeometry(size),
// 		torus: () =>
// 			new TorusGeometry(
// 				size / 2,
// 				size / 4,
// 				16 * segmentMultiplier,
// 				100 * segmentMultiplier
// 			),
// 		torusKnot: () =>
// 			new TorusKnotGeometry(
// 				size / 2,
// 				size / 4,
// 				16 * segmentMultiplier,
// 				100 * segmentMultiplier
// 			)
// 	};

// 	const mesh = new Mesh(
// 		(geometriesMap[type] || geometriesMap['box'])(),
// 		material
// 	);
// 	mesh.castShadow = true;
// 	mesh.name = type;

// 	return mesh;
// };

export const handleKeepPerspectiveCameraAspectRatioOnResize = ({
	camera,
	scene,
	renderer
}: {
	camera: PerspectiveCamera;
	scene: Scene;
	renderer: WebGL1Renderer;
}) => {
	const tanFOV = Math.tan(((Math.PI / 180) * camera.fov) / 2);

	window.addEventListener('resize', onWindowResize, false);

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;

		// adjust the FOV
		camera.fov =
			(360 / Math.PI) *
			Math.atan(tanFOV * (window.innerHeight / window.innerHeight));

		camera.updateProjectionMatrix();
		camera.lookAt(scene.position);

		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.render(scene, camera);
	}

	return {
		removeEventListener: () =>
			window.removeEventListener('resize', onWindowResize, false)
	};
};
