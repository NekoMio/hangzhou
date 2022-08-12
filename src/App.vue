<template>
  <div>
    <canvas id="three"></canvas>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import data from "./assets/3d_data0.json";
let bones = [1, 2, 4, 5, 7, 8, 11, 12, 14, 15]; // 親ボーン
let child_bones = [2, 3, 5, 6, 8, 10, 12, 13, 15, 16];
let init_inv = new Array();
let init_vec = new Array();
let scale_ratio = 0.003;
let heal_position = 0.0;
let init_position;
let scene = null;

export default {
  mounted() {
    this.initThree();
  },
  methods: {
    initThree() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color("#eee");
      const canvas = document.querySelector("#three");
      const loader = new FBXLoader();
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      const axes = new THREE.AxesHelper();
      const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.3,
        1000
      );
      const controls = new OrbitControls(camera, renderer.domElement);
      camera.position.set(0, 0, 2);
      // camera.rotation.set(0, 0, 0)
      camera.up.set(0, 1, 0);
      scene.add(axes);
      loader.load("/model/xbot.fbx", (object) => {
        object.scale.set(0.01, 0.01, 0.01);
        object.position.set(0, 0, 0);
        object.rotation.set(0, 0, 0);
        scene.add(object);
        object.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        // let root = scene.getObjectByProperty("type", "Bone");
        console.log(object);
        let init_forward = TriangleNormal(
          GetBoneTransform(7).position,
          GetBoneTransform(4).position,
          GetBoneTransform(1).position
        );
        console.log(init_forward);
        init_inv[0] = LookRotation(
          init_forward,
          new THREE.Vector3(0, 1, 0)
        ).invert();
        init_position = new THREE.Vector3();
        GetBoneTransform(0).getWorldPosition(init_position);

        // Test Update

        for (let i = 0; i < bones.length; i++) {
          const b = bones[i];
          const c = child_bones[i];
          let vecB = new THREE.Vector3();
          let vecC = new THREE.Vector3();
          GetBoneTransform(b).getWorldPosition(vecB);
          GetBoneTransform(c).getWorldPosition(vecC);
          init_vec[i].subVectors(vecB, vecC);
        }

        let now_pos = [];
        for (let i = 0; i < data[0].length; i++) {
          now_pos[i] = new THREE.Vector3(data[0][i], data[2][i], -data[1][i]);
        }
        let pos_forward = TriangleNormal(now_pos[7], now_pos[4], now_pos[1]);
        console.log(pos_forward);
        


      });
      let LookRotation = (forward, up) => {
        const vector = forward.clone().normalize();
        const vector2 = new THREE.Vector3()
          .crossVectors(up, vector)
          .normalize();
        const vector3 = new THREE.Vector3()
          .crossVectors(vector, vector2)
          .normalize();
        const m00 = vector2.x;
        const m01 = vector2.y;
        const m02 = vector2.z;
        const m10 = vector3.x;
        const m11 = vector3.y;
        const m12 = vector3.z;
        const m20 = vector.x;
        const m21 = vector.y;
        const m22 = vector.z;

        const num8 = m00 + m11 + m22;
        const quaternion = new THREE.Quaternion();
        if (num8 > 0) {
          let num = Math.sqrt(num8 + 1);
          quaternion.w = num * 0.5;
          num = 0.5 / num;
          quaternion.x = (m12 - m21) * num;
          quaternion.y = (m20 - m02) * num;
          quaternion.z = (m01 - m10) * num;
          return quaternion;
        }
        if (m00 >= m11 && m00 >= m22) {
          const num7 = Math.sqrt(1 + m00 - m11 - m22);
          const num4 = 0.5 / num7;
          quaternion.x = 0.5 * num7;
          quaternion.y = (m01 + m10) * num4;
          quaternion.z = (m02 + m20) * num4;
          quaternion.w = (m12 - m21) * num4;
          return quaternion;
        }
        if (m11 > m22) {
          const num6 = Math.sqrt(1 + m11 - m00 - m22);
          const num3 = 0.5 / num6;
          quaternion.x = (m10 + m01) * num3;
          quaternion.y = 0.5 * num6;
          quaternion.z = (m21 + m12) * num3;
          quaternion.w = (m20 - m02) * num3;
          return quaternion;
        }
        const num5 = Math.sqrt(1 + m22 - m00 - m11);
        const num2 = 0.5 / num5;
        quaternion.x = (m20 + m02) * num2;
        quaternion.y = (m21 + m12) * num2;
        quaternion.z = 0.5 * num5;
        quaternion.w = (m01 - m10) * num2;
        return quaternion;
      };
      let TriangleNormal = (a, b, c) => {
        console.log(a, b, c);
        let d1 = new THREE.Vector3().subVectors(a, b);
        let d2 = new THREE.Vector3().subVectors(a, c);

        // console.log(d1, d2)
        let normal = new THREE.Vector3().crossVectors(d2, d1);
        // normal.crossVectors(d1, d2);
        // console.log(normal)
        normal.normalize();
        return normal;
      };
      let GetBoneTransform = (boneId) => {
        // return scene.getObjectByName("Character1_" + GetBoneTransform_text(boneId))
        return scene.getObjectByName(
          "mixamorig" + GetBoneTransform_text(boneId)
        );
      };
      let GetBoneTransform_text = (boneId) => {
        switch (boneId) {
          case 0:
            return "Hips";
          case 1:
            return "RightUpLeg";
          case 2:
            return "RightLeg";
          case 3:
            return "RightFoot";
          case 4:
            return "LeftUpLeg";
          case 5:
            return "LeftLeg";
          case 6:
            return "LeftFoot";
          case 7:
            return "Spine";
          case 8:
            return "Neck";
          case 9:
            return "";
          case 10:
            return "Head";
          case 11:
            return "LeftShoulder";
          case 12:
            return "LeftArm";
          case 13:
            return "LeftHand";
          case 14:
            return "RightShoulder";
          case 15:
            return "RightArm";
          case 16:
            return "RightHand";
          default:
            return "unknown";
        }
      };
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

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
      //光源等位置
      dirLight.position.set(-10, 8, -5);
      //可以产生阴影
      dirLight.castShadow = true;
      dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
      scene.add(dirLight);
      const hemLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
      hemLight.position.set(0, 48, 0);
      scene.add(hemLight);
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
        // console.log(camera.rotation)
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
