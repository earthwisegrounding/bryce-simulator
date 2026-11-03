// The 3D headbanger. Renders offscreen, then gets drawn into the 2D stage canvases.
// If WebGL or the model isn't available, ready stays false and the game uses the 2D figure.

// Height of the view in world units, and how far below the feet the view starts.
const VIEW_HEIGHT = 2.6;
const VIEW_BELOW_FEET = 0.3;
const MODEL_HEIGHT = 1.7;
// Turned partly side-on so the head whip reads as a whip. In radians.
const TURNED_AWAY = 0.6;

const stage3d = {
  ready: false,
  bones: {},
  rest: new Map(),

  async init() {
    if (!window.THREE || !THREE.GLTFLoader || !window.HAIRSTORM_GLB) return;
    try {
      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      this.renderer.setPixelRatio(1);
      this.renderer.setSize(800, 800, false);
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.outputEncoding = THREE.sRGBEncoding;

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(24, 1, 0.1, 30);
      const distance = VIEW_HEIGHT / 2 / Math.tan(THREE.MathUtils.degToRad(12));
      this.camera.position.set(0, VIEW_HEIGHT / 2 - VIEW_BELOW_FEET, distance);
      this.camera.lookAt(0, VIEW_HEIGHT / 2 - VIEW_BELOW_FEET, 0);

      this.scene.add(new THREE.HemisphereLight(0xffffff, 0x553366, 0.55));
      const key = new THREE.DirectionalLight(0xffffff, 0.4);
      key.position.set(0.5, 2, 4);
      const pink = new THREE.DirectionalLight(0xff2aa0, 1.6);
      pink.position.set(-4, 2, 1.5);
      const blue = new THREE.DirectionalLight(0x4a6bff, 1.6);
      blue.position.set(4, 2, 1.5);
      this.scene.add(key, pink, blue);

      const bytes = Uint8Array.from(atob(window.HAIRSTORM_GLB), (c) => c.charCodeAt(0));
      const gltf = await new Promise((resolve, reject) => {
        new THREE.GLTFLoader().parse(bytes.buffer, "", resolve, reject);
      });
      this.model = gltf.scene;
      this.model.rotation.y = TURNED_AWAY;
      this.scene.add(this.model);
      this.model.traverse((node) => {
        if (node.isBone) {
          this.bones[node.name] = node;
          this.rest.set(node, node.quaternion.clone());
        }
        if (node.isMesh) node.frustumCulled = false;
      });
      this.ready = true;
    } catch (error) {
      console.warn("Using the 2D headbanger:", error);
    }
  },

  // Rotates a bone around a world axis, measured from its rest pose. Call parents first.
  turn(name, axis, radians) {
    const bone = this.bones[name];
    const parent = bone.parent.getWorldQuaternion(new THREE.Quaternion());
    const world = new THREE.Quaternion().setFromAxisAngle(axis, radians);
    bone.quaternion
      .copy(parent.clone().invert())
      .multiply(world)
      .multiply(parent)
      .multiply(this.rest.get(bone));
    bone.updateMatrixWorld(true);
  },

  // angle runs from about -0.25 (head back) to 1.05 (full bang), same as the 2D figure.
  pose(angle) {
    const pitch = new THREE.Vector3(Math.cos(TURNED_AWAY), 0, -Math.sin(TURNED_AWAY));
    this.turn("Bone_003", pitch, angle * 0.25);
    this.turn("Bone_002", pitch, angle * 0.3);
    this.turn("Bone_026", pitch, angle * 0.4);
    this.turn("Bone_025", pitch, angle * 0.5);
    this.model.position.y = -Math.max(0, angle) * 0.03;
  },

  // Draws so the feet land on footY and the model stands height pixels tall.
  draw(ctx, x, footY, height) {
    this.renderer.render(this.scene, this.camera);
    const size = (height * VIEW_HEIGHT) / MODEL_HEIGHT;
    const top = footY - size * (1 - VIEW_BELOW_FEET / VIEW_HEIGHT);
    ctx.drawImage(this.renderer.domElement, x - size / 2, top, size, size);
  },
};
