<template>
  <div>
    <canvas id="three"></canvas>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
export default {
  mounted() {
    this.initThree();
  },
  methods: {
    initThree() {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#eee");
      const canvas = document.querySelector("#three");
      const loader = new FBXLoader();
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      const controls = new OrbitControls(camera, renderer.domElement);
      camera.position.z = 10;
      
      loader.load("/model/xbot.fbx", (object) => {
        scene.add(object);
        object.scale.set(0.03, 0.03, 0.03);
        object.position.set(0, -3, 0);
        object.rotation.set(0, 0, 0);
        object.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        })
        // for (let i = 0; i < object.children.length; i++) {
        //   // if (object.children[i].name === "mixamorigHips") {
        //   console.log(object.children[i]);
        //   // }
        // }
        let root = scene.getObjectByProperty("type", "Bone")
        // console.log(root)
        // let boneNames = []
        // let DFSname = (root) => {
        //   if (root.children.length > 0) {
        //     for (let i = 0; i < root.children.length; i++) {
        //       if (root.children[i].type === "Bone" && root.children[i].ID !== root.ID) {
        //         boneNames.push(root.children[i].name)
        //         DFSname(root.children[i])
        //       }
        //     }
        //   }
        // }
        // DFSname(root)
        // console.log(boneNames)
      });
      let GetBoneTransform = (boneId) => {
        switch (boneId) {
          case 0:
            return "Hips"
          case 1:
            return "RightUpLeg"
          case 2:
            return "RightLeg"
          case 3:
            return "RightFoot"
          case 4:
            return "LeftUpLeg"
          case 5:
            return "LeftLeg"
          case 6:
            return "LeftFoot"
          case 7:
            return "Spine"
          case 8:
            return "Spine1"
          case 9:
            return "Neck"
          case 10:
            return "Head"
          case 11:
            return "LeftShoulder"
          case 12:
            return "LeftArm"
          case 13:
            return "LeftHand"
          case 14:
            return "RightShoulder"
          case 15:
            return "RightArm"
          case 16:
            return "RightHand"
          default:
            return "unknown"
        }
      }
      /*
        bone_t[0] = anim.GetBoneTransform(HumanBodyBones.Hips);
        bone_t[1] = anim.GetBoneTransform(HumanBodyBones.RightUpperLeg);
        bone_t[2] = anim.GetBoneTransform(HumanBodyBones.RightLowerLeg);
        bone_t[3] = anim.GetBoneTransform(HumanBodyBones.RightFoot);
        bone_t[4] = anim.GetBoneTransform(HumanBodyBones.LeftUpperLeg);
        bone_t[5] = anim.GetBoneTransform(HumanBodyBones.LeftLowerLeg);
        bone_t[6] = anim.GetBoneTransform(HumanBodyBones.LeftFoot);
        bone_t[7] = anim.GetBoneTransform(HumanBodyBones.Spine);
        bone_t[8] = anim.GetBoneTransform(HumanBodyBones.Neck);
        bone_t[10] = anim.GetBoneTransform(HumanBodyBones.Head);
        bone_t[11] = anim.GetBoneTransform(HumanBodyBones.LeftUpperArm);
        bone_t[12] = anim.GetBoneTransform(HumanBodyBones.LeftLowerArm);
        bone_t[13] = anim.GetBoneTransform(HumanBodyBones.LeftHand);
        bone_t[14] = anim.GetBoneTransform(HumanBodyBones.RightUpperArm);
        bone_t[15] = anim.GetBoneTransform(HumanBodyBones.RightLowerArm);
        bone_t[16] = anim.GetBoneTransform(HumanBodyBones.RightHand); 
      */
      // let floorGeometry = new THREE.PlaneGeometry(3000, 3000);
      // let floorMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
      // let floor = new THREE.Mesh(floorGeometry, floorMaterial);
      // floor.rotation.x = -0.5 * Math.PI;
      // floor.receiveShadow = true;
      // floor.position.y = -0.001;
      // scene.add(floor);

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.6)
      //光源等位置
      dirLight.position.set(-10, 8, -5)
      //可以产生阴影
      dirLight.castShadow = true
      dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024)
      scene.add(dirLight)
      const hemLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6)
      hemLight.position.set(0, 48, 0)
      scene.add(hemLight)
      function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        var width = window.innerWidth;
        var height = window.innerHeight;
        var canvasPixelWidth = canvas.width / window.devicePixelRatio;
        var canvasPixelHeight = canvas.height / window.devicePixelRatio;

        const needResize =
          canvasPixelWidth !== width || canvasPixelHeight !== height;
        if (needResize) {
          renderer.setSize(width, height, false);
        }
        return needResize;
      }
      function animate() {
        // renderer.render(scene, camera)
        controls.enableDamping = true;
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
        if (resizeRendererToDisplaySize(renderer)) {
          const canvas = renderer.domElement;
          camera.aspect = canvas.clientWidth / canvas.clientHeight;
          camera.updateProjectionMatrix();
        }
      }
      animate();
    },
  },
};
</script>

<style scoped>
#three {
  width: 100%;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
}
</style>
