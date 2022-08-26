<template>
  <div
    class="w-screen h-screen left-0 top-0 fixed"
    style="
      background: linear-gradient(156.78deg, #5367c9 29.61%, #b691c1 85.65%);
    "
  >
    <canvas
      class="w-2/3 h-2/3 bottom-[16.666667%] left-[8%] fixed z-50"
      id="three"
    ></canvas>
    <div class="w-screen h-screen left-0 top-0 z-10 fixed">
      <div class="left-4 top-6 w-40 h-32 flex flex-col items-center">
        <div
          class="m-0 text-xs not-italic font-serif font-normal leading-4 text-white"
        >
          亚运会体育图标动作模仿游戏 
        </div>
        <img class="mt-2 w-28 h-28" src="./assets/img/logo.svg" alt="logo" />
      </div>
      <div
        class="right-4 top-6 w-56 h-auto fixed flex flex-col rounded-lg shadow-2xl shadow-slate-800"
        style="background-color: rgba(16, 15, 70, 0.5)"
      >
        <div
          v-if="!started"
          class="w-32 ml-3 mt-10 text-xl leading-6 font-normal font-serif text-white animate-pulse"
          
        >
          模仿这个动作开始游戏吧！
        </div>
        <template v-else>
          <div
            class="w-32 ml-3 mt-4 text-xl leading-6 font-normal font-serif text-white"
          >
            当前动作
          </div>
          <div
            class="w-32 ml-3 mt-4 text-xl leading-6 font-normal font-serif text-white"
          >
            <span
              class="ml-1 icon-before icon-solid icon-clock-rotate-left"
            ></span>
            <span class="ml-3">{{ currentTime }} s</span>
          </div>
        </template>
        <div class="w-3/4 mx-3 my-4 bg-white h-0.5"></div>
        <div
          class="w-32 ml-3 text-xl leading-6 font-normal font-serif text-white"
        >
          {{ poseNameCN }}
        </div>
        <div
          class="w-32 ml-3 text-xl leading-6 font-normal font-serif text-white"
        >
          {{ poseNameEN }}
        </div>
        <img class="w-52 mx-auto mt-3 mb-5" :src="posePic" />
      </div>
      <template v-if="started">
        <div
          class="h-1/2 w-2.5 left-9 rounded-full top-8"
          style="
            background: linear-gradient(
              180deg,
              rgb(0, 255, 0, 255) 0%,
              rgb(255, 0, 0, 255) 100%
            );
          "
        >
          <div
            class="w-5 h-5 top-32 -left-[0.3125rem] absolute rounded-full bg-white blur-[2px]"
          ></div>
          <!-- <div class="h-full w-full rounded-full" style="background: linear-gradient(180deg, #E48225 0%, rgba(254, 223, 77, 0) 100%)"> -->
          <div
            class="w-full absolute bottom-0 block rounded-full"
            :style="{ height: percentage + '%' }"
          >
            <div
              class="rounded-full w-11 h-11 left-6 border-[3px] -top-5 mb-4 border-solid border-white text-xl text-white font-mono font-normal flex items-center justify-around flex-col"
            >
              {{ percentage }}
            </div>
            <div
              class="w-6 h-6 -top-2.5 -left-[0.4375rem] absolute rounded-full bg-yellow-200 blur-[2px]"
            ></div>
          </div>
          <!-- </div> -->
        </div>
      </template>
    </div>
    <img
      class="bottom-0 w-screen h-auto z-0 fixed"
      src="./assets/img/bottom-bg.svg"
      alt=""
    />
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
  SkeletonHelper,
} from "three";
import { inject } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
let bones = [1, 2, 4, 5, 7, 8, 11, 12, 14, 15]; // 親ボーン
let child_bones = [2, 3, 5, 6, 8, 10, 12, 13, 15, 16];
let init_inv = new Array();
let init_rot = new Array();
let scale_ratio = 0.003;
let heal_position = 0.0;
let init_position;
let scene = null;

export default {
  data() {
    return {
      poseNameCN: "跆拳道",
      poseNameEN: "Taekwondo",
      posePic: "/pic/cut/pose-09-crop.png",
      percentage: 40,
      started: false,
      currentTime: "00:14",
      preData: {},
      // socket = inject("socket"),
    };
  },
  mounted() {
    this.initThree();
    this.$socket.on("connect", () => {
      console.log("connect");
      this.$socket.emit("connection", "connected");
    });
    this.$socket.on("disconnect", () => {
      console.log("disconnect");
    });
    this.$socket.on("message", (data) => {
      data = data[0]
      console.log(data);
      // data = JSON.parse(data);
      
      if (data.started == true) {
        if (this.started == false) {
          this.currentTime = 0;
        } 
      }
      if (data.started == false) {
        if (this.started == true) {
          this.showEndPage();
        }
      }

      this.started = data.started;
      this.percentage = data.percentage;
      this.poseNameCN = data.poseID;
      this.poseNameEN = data.poseID;
      this.posePic = this.getPicUrl(data.poseID);
      this.updatePos(data["3dpose"]);
    });
    // setInterval(() => {
    //   this.percentage += 1;
    //   // this.currentTime = this.getTime();
    // }, 200);
  },
  methods: {
    getPicUrl(poseNameEN) {
      return `/pic/cut/${poseNameEN}.png`;
    }, // 获取图片url
    initThree() {
      scene = new Scene();
      // scene.background = new THREE.Color("0x00000000");
      const canvas = document.querySelector("#three");
      // const loader = new FBXLoader();
      const loader = new GLTFLoader();
      
      const renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      // const axes = new AxesHelper();
      const camera = new PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.3,
        1000
      );
      const controls = new OrbitControls(camera, renderer.domElement);
      camera.position.set(0, 0, 3);
      renderer.setClearColor(0xffffff, 0);
      scene.background = null;
      // camera.rotation.set(0, 0, 0)
      camera.up.set(0, 1.5, 0);
      // scene.add(axes);
      loader.load("/model/m.gltf", (gltf) => {
        let object = gltf.scene;

        object.scale.set(30, 30, 30);
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
        const helper = new SkeletonHelper(object);
        helper.material.linewidth = 2;
        scene.add(helper);
        let init_forward = this.TriangleNormal(
          this.GetBoneTransform(7).position,
          this.GetBoneTransform(4).position,
          this.GetBoneTransform(1).position
        );
        // console.log(init_forward);
        init_inv[0] = this.LookRotation(init_forward, new Vector3(0, 1, 0)).invert();
        // init_position = new THREE.Vector3();
        // scene.updateMatrixWorld(true);
        // this.GetBoneTransform(0).getWorldPosition(init_position);
        // init_position = this.GetBoneTransform(0).position.clone();
        this.GetBoneTransform(0).position.set(0, 0, 0);
        // Test Update
        
        for (let i = 0; i < 17; i++) {
          if (this.GetBoneTransform(i)) {
            init_rot[i] = this.GetBoneTransform(i).rotation.clone();
          }
        }
        object.traverse((child) => {
          if (child.isBone) {
            let pos = new Vector3();
            let rot = new Quaternion();
            child.getWorldPosition(pos);
            child.getWorldQuaternion(rot);
            console.log(child.name, pos, rot);
            console.log(child);
          }
        });
        // let init_pos = new Vector3();
        // let init_rev = new Quaternion()
        // this.GetBoneTransform(11).getWorldPosition(init_pos);
        // ;
        // console.log(init_pos, this.GetBoneTransform(11).quaternion);

        // console.log(object)
      });

      

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
    LookRotation(forward, up) {
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
      },
    TriangleNormal(a, b, c) {
      // console.log(a, b, c);
      let d1 = new Vector3().subVectors(a, b);
      let d2 = new Vector3().subVectors(a, c);

      // console.log(d1, d2)
      let normal = new Vector3().crossVectors(d2, d1);
      // normal.crossVectors(d1, d2);
      // console.log(normal)
      normal.normalize();
      return normal;
    },
    GetBoneTransform(boneId) {
      // return scene.getObjectByName("Character1_" + GetBoneTransform_text(boneId))
      return scene.getObjectByName("mixamorig" + this.GetBoneTransform_text(boneId));
    },
    GetBoneTransform_text(boneId) {
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
    },
    updatePos(data) {
      // console.log("111");
      console.log(data);
      let now_pos = [];
      for (let i = 0; i < data.length; i++) {
        now_pos[i] = new Vector3(-data[i][0], data[i][1], -data[i][2]);
      }
      let pos_forward = this.TriangleNormal(now_pos[7], now_pos[4], now_pos[1]);
      // console.log(pos_forward);

      // console.log(init_position)

      // GetBoneTransform(0).position.set(init_position.x + now_pos[0].x * scale_ratio, init_position.y + now_pos[0].y * scale_ratio, init_position.z + now_pos[0].z * scale_ratio);
      scene.updateMatrixWorld(true);
      // for (let i = 6; i < 7; i++) {
      for (let i = 0; i < bones.length; i++) {
        const b = bones[i];
        const c = child_bones[i];
        let now_vec = now_pos[c].clone().sub(now_pos[b]).normalize();
        let vecB = new Vector3();
        let vecC = new Vector3();
        scene.updateMatrixWorld(true);
      
        this.GetBoneTransform(b).getWorldPosition(vecB);
        this.GetBoneTransform(c).getWorldPosition(vecC);
        console.log("------------------------")
        console.log(vecC.clone().sub(vecB).normalize())

        let new_vecC = vecC.clone().sub(vecB).normalize().add(vecB);
        
        let new_now_posC = now_vec.clone().add(vecB);
        // console.log(vecB, new_vecC, new_now_posC);
        let matrixWorld = this.GetBoneTransform(b).matrixWorld.clone()
        this.GetBoneTransform(b).worldToLocal(vecB);
        this.GetBoneTransform(b).worldToLocal(new_vecC);
        this.GetBoneTransform(b).worldToLocal(new_now_posC);
        // console.log(vecB, new_vecC);

        let init_vec = new_vecC.clone().sub(vecB).normalize();

        // let new_now_posB = this.GetBoneTransform(b).worldToLocal(now_pos[b].clone());
        // let new_now_posC = this.GetBoneTransform(b).worldToLocal(now_pos[c].clone());
      
        // console.log(new_now_posC, vecC);
        let new_now_vec = new_now_posC.clone().sub(vecB).normalize();
        


        // this.GetBoneTransform(b).getWorldQuaternion(init_rot[b]);
        // init_rot[b].invert();
        

        // if (bones.length - i <= 2) {
        //   console.log(b, c)
        // }
        
        console.log(init_vec, new_now_vec, now_vec);

        // console.log(init_vec.clone().dot(new_now_vec));

        // let tmp = new Vector3()
        // console.log(this.GetBoneTransform(b).getWorldDirection(tmp));
        // init_vec = this.GetBoneTransform(b).localToWorld(init_vec);
        // now_vec = this.GetBoneTransform(b).localToWorld(now_vec);
        // console.log(init_vec, now_vec);
        let rotation = new Quaternion().setFromUnitVectors(
          // this.GetBoneTransform(b).position.clone().sub(this.GetBoneTransform(c).position).normalize(),
          init_vec,
          new_now_vec
        ).invert()
        console.log(rotation);
        
        // let ret_vec = new Vector3().crossVectors(new Vector3(0, 1, 0), now_vec).add(vecB)

        // this.GetBoneTransform(b).lookAt(ret_vec);
        // this.GetBoneTransform(b).applyQuaternion(this.LookRotation(now_vec, new Vector3(0, 1, 0)));
        // console.log(this.GetBoneTransform(b).quaternion)
        this.GetBoneTransform(b).applyQuaternion(rotation);
        // console.log(this.GetBoneTransform(b).quaternion)
        
        // console.log(this.GetBoneTransform(b));
        this.GetBoneTransform(b).getWorldPosition(vecB);
        this.GetBoneTransform(c).getWorldPosition(vecC);
        init_vec = vecC.clone().sub(vecB).normalize();

        vecB.applyMatrix4(matrixWorld)
        vecC.applyMatrix4(matrixWorld)

        let debug_vec = vecC.clone().sub(vecB).normalize();
        console.log(init_vec, debug_vec);
      }
      scene.updateMatrixWorld(true);
      // this.GetBoneTransform(0).position.set(
      //   now_pos[0].x * scale_ratio,
      //   now_pos[0].y * scale_ratio,
      //   now_pos[0].z * scale_ratio
      // );
    },
  },
};
</script>

<style scoped></style>
