<template>
  <div
    class="w-screen h-screen left-0 top-0 fixed"
    style="
      background: linear-gradient(156.78deg, #5367c9 29.61%, #b691c1 85.65%);
    "
  >
    <canvas
      class="w-screen h-screen fixed left-0 top-0 z-50"
      id="three"
    ></canvas>
    <div class="w-screen h-screen left-0 top-0 z-10 fixed">
      <div class="left-4 top-6 w-40 h-32 flex flex-col items-center">
        <div class="m-0 text-xs not-italic font-serif font-normal leading-4 text-white">亚运会体育图标动作模仿游戏</div>
        <img class="mt-2 w-24 h-24" src="./assets/img/logo.png">
      </div>
    </div>
  </div>
</template>

<script>
import {
  Scene,
  WebGLRenderer,
  AxesHelper,
  PerspectiveCamera,
  Vector3,
  Vector2,
  Quaternion,
  DirectionalLight,
  HemisphereLight,
} from "three";
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
      scene = new Scene();
      // scene.background = new THREE.Color("0x00000000");
      const canvas = document.querySelector("#three");
      const loader = new FBXLoader();
      const renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      const axes = new AxesHelper();
      const camera = new PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.3,
        1000
      );
      const controls = new OrbitControls(camera, renderer.domElement);
      camera.position.set(0, 0, 2);
      renderer.setClearColor(0xffffff, 0);
      scene.background = null;
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
        // console.log(object);
        let init_forward = TriangleNormal(
          GetBoneTransform(7).position,
          GetBoneTransform(4).position,
          GetBoneTransform(1).position
        );
        // console.log(init_forward);
        init_inv[0] = LookRotation(init_forward, new Vector3(0, 1, 0)).invert();
        // init_position = new THREE.Vector3();
        // scene.updateMatrixWorld(true);
        // GetBoneTransform(0).getWorldPosition(init_position);
        init_position = GetBoneTransform(0).position.clone();

        // Test Update

        // for (let i = 0; i < bones.length; i++) {
        //   const b = bones[i];
        //   const c = child_bones[i];
        //   let vecB = new THREE.Vector3();
        //   let vecC = new THREE.Vector3();
        //   GetBoneTransform(b).getWorldPosition(vecB);
        //   GetBoneTransform(c).getWorldPosition(vecC);
        //   // let vecB = GetBoneTransform(b).position.clone();
        //   // let vecC = GetBoneTransform(c).position.clone();
        //   console.log(vecB, vecC);
        //   init_vec[i] = vecB.clone().sub(vecC).normalize();
        // }
        // console.log("\n");
        let now_pos = [];
        for (let i = 0; i < data[0].length; i++) {
          now_pos[i] = new Vector3(data[0][i], data[2][i], -data[1][i]);
        }
        let pos_forward = TriangleNormal(now_pos[7], now_pos[4], now_pos[1]);
        // console.log(pos_forward);

        // console.log(init_position)

        // GetBoneTransform(0).position.set(init_position.x + now_pos[0].x * scale_ratio, init_position.y + now_pos[0].y * scale_ratio, init_position.z + now_pos[0].z * scale_ratio);
        // scene.updateMatrixWorld(true);

        for (let i = 0; i < bones.length; i++) {
          const b = bones[i];
          const c = child_bones[i];
          let now_vec = now_pos[c].clone().sub(now_pos[b]).normalize();
          let vecB = new Vector3();
          let vecC = new Vector3();
          scene.updateMatrixWorld(true);
          GetBoneTransform(b).getWorldPosition(vecB);
          GetBoneTransform(c).getWorldPosition(vecC);
          let init_vec = vecC.clone().sub(vecB).normalize();

          // if (bones.length - i <= 2) {
          //   console.log(b, c)
          // }
          let rotation = new Quaternion().setFromUnitVectors(
            // GetBoneTransform(b).position.clone().sub(GetBoneTransform(c).position).normalize(),
            init_vec,
            now_vec
          );

          // console.log(rotation);

          GetBoneTransform(b).quaternion.multiply(rotation);
          // vec = GetBoneTransform(child_bones[i]).position.clone().sub(GetBoneTransform(bones[i]).position.clone());
          // GetBoneTransform(c).getWorldPosition(vecC);
          // GetBoneTransform(b).getWorldPosition(vecB);
          // console.log(vecC.clone().sub(vecB).normalize());
          // console.log(now_vec);
        }
        scene.updateMatrixWorld(true);
        GetBoneTransform(0).position.set(
          now_pos[0].x * scale_ratio,
          now_pos[0].y * scale_ratio,
          now_pos[0].z * scale_ratio
        );
        // console.log(object)
      });
      let LookRotation = (forward, up) => {
        const vector = forward.clone().normalize();
        const vector2 = new Vector3().crossVectors(up, vector).normalize();
        const vector3 = new Vector3().crossVectors(vector, vector2).normalize();
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
        const quaternion = new Quaternion();
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
        // console.log(a, b, c);
        let d1 = new Vector3().subVectors(a, b);
        let d2 = new Vector3().subVectors(a, c);

        // console.log(d1, d2)
        let normal = new Vector3().crossVectors(d2, d1);
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
            return "LeftArm";
          case 12:
            return "LeftForeArm";
          case 13:
            return "LeftHand";
          case 14:
            return "RightArm";
          case 15:
            return "RightForeArm";
          case 16:
            return "RightHand";
          // case 11:
          //   return "LeftShoulder";
          // case 12:
          //   return "LeftArm";
          // case 13:
          //   return "LeftHand";
          // case 14:
          //   return "RightShoulder";
          // case 15:
          //   return "RightArm";
          // case 16:
          //   return "RightHand";
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

      const dirLight = new DirectionalLight(0xffffff, 0.6);
      //光源等位置
      dirLight.position.set(-10, 8, -5);
      //可以产生阴影
      dirLight.castShadow = true;
      dirLight.shadow.mapSize = new Vector2(1024, 1024);
      scene.add(dirLight);
      const hemLight = new HemisphereLight(0xffffff, 0xffffff, 0.6);
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

<style scoped></style>
