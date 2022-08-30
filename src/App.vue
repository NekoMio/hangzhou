<template>
  <div
    class="w-screen h-screen left-0 top-0 fixed"
    style="
      background: linear-gradient(156.78deg, #5367c9 29.61%, #b691c1 85.65%);
    "
  >
    <Transition name="fade">
      <canvas
        v-if="!showEnd"
        class="w-2/3 h-2/3 bottom-[16.666667%] left-[15%] fixed z-50"
        id="three"
      ></canvas
    ></Transition>
    <Transition name="fade">
      <div
        v-if="showEnd"
        class="w-screen h-screen left-0 top-0 z-10 fixed flex flex-row items-center justify-center"
      >
        <div
          class="xl:w-1/3 w-2/3 h-1/2 rounded-lg shadow-2xl shadow-slate-800"
          style="background-color: rgba(16, 15, 70, 0.5)"
        >
          <div class="w-full h-1/5 pl-8 pt-8">
            <p class="text-4xl font-normal text-white">游戏结束！</p>
            <p class="text-xl font-normal text-white">End of game!</p>
          </div>
          <div class="mx-8 my-4 bg-white h-0.5"></div>
          <div class="w-full h-1/6 px-8 pt-2">
            <p class="text-xl font-normal text-white">
              您的用时为: {{ totalTime }} 秒
            </p>
            <p class="text-xl font-normal text-white">
              Your time is: {{ totalTime }} seconds
            </p>
          </div>
          <div>
            <p class="text-xl font-normal text-white text-center">用时排行</p>
          </div>
          <div class="mx-8 my-4 bg-white h-0.5"></div>
          <div class="flex items-center justify-center">
            <table class="table-auto mx-8 w-3/4">
              <thead class="mx-8">
                <tr class="text-white">
                  <th class="px-4 py-2 w-1/3">排名</th>
                  <th class="px-4 py-2 w-1/3">时间</th>
                </tr>
              </thead>
              <tbody class="mx-8">
                <tr
                  v-for="(item, index) in rankList"
                  :key="index"
                  class="text-white"
                >
                  <td class="border-y px-4 py-1 w-1/3 text-center">
                    {{ index + 1 }}
                  </td>
                  <td class="border-y border-l px-4 p-1 w-1/3 text-center">
                    {{ item }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Transition>
    <div class="w-screen h-screen left-0 top-0 z-10 fixed">
      <div class="left-16 top-10 w-48 h-32 flex flex-col items-center">
        <div
          class="m-0 text-sm not-italic font-serif font-normal leading-5 text-white"
        >
          亚运会体育图标动作模仿游戏
        </div>
        <img class="mt-2 w-28 h-28" src="./assets/img/logo.svg" alt="logo" />
      </div>
      <Transition name="fade">
        <div
          v-if="!showEnd"
          class="xl:left-[70%] right-8 top-6 w-56 h-auto fixed flex flex-col rounded-lg shadow-2xl shadow-slate-800"
          style="background-color: rgba(16, 15, 70, 0.5)"
        >
          <div
            v-if="!started"
            class="w-32 ml-3 mt-10 text-xl leading-6 font-normal font-serif text-white animate-pulse"
          >
            模仿这个动作开始游戏吧！
          </div>
          <div v-if="started">
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
              <span class="ml-3"
                >{{
                  this.PrefixInteger(Math.floor(currentTime / 60)) +
                  ":" +
                  this.PrefixInteger(currentTime % 60)
                }}
                s</span
              >
            </div>
          </div>
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
          <img
            v-if="currentTime < 20"
            class="w-52 mx-auto mt-3 mb-5"
            :src="posePic"
            alt="静态图"
          />
          <img
            v-else
            class="w-52 mx-auto mt-3 mb-5"
            :src="poseGif"
            alt="动态图"
          />
        </div>
      </Transition>
      <Transition name="fade">
        <template v-if="started && !showEnd">
          <div
            class="h-1/2 w-2.5 xl:left-96 left-32 top-52 fixed rounded-full bar"
          >
            <div
              class="w-5 h-5 -top-2.5 -left-[0.3125rem] absolute rounded-full bg-white blur-[2px]"
            ></div>
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
                class="w-6 h-6 -top-2.5 -left-[0.4375rem] absolute rounded-full blur-[2px]"
                :style="{ backgroundColor: nowColor }"
              ></div>
            </div>
            <!-- </div> -->
          </div>
        </template>
      </Transition>
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
  PerspectiveCamera,
  Vector3,
  Vector2,
  Quaternion,
  DirectionalLight,
  HemisphereLight,
  SkeletonHelper,
  Mesh,
  CircleGeometry,
  MeshMatcapMaterial,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
let bones = [1, 2, 4, 5, 7, 8, 11, 12, 14, 15]; // 親ボーン
let child_bones = [2, 3, 5, 6, 8, 10, 12, 13, 15, 16];
let englishToChinese = {
  Archery: "射箭",
  Shooting: "射击",
  Boxing: "拳击",
  Wushu: "武术",
  Athletics: "田径",
  "Canoe Sprint": "皮划艇静水",
  Equestrian: "马术",
  Fencing: "击剑",
  Karate: "空手道",
  "Roller Skating": "轮滑",
  Skateboarding: "滑板",
  "Sport Climbing": "攀岩",
  Taekwondo: "跆拳道",
  Triathlon: "铁人三项",
  Weightlifting: "举重",
  Basketball: "五人制篮球",
  Badminton: "羽毛球",
  Baseball: "棒球",
  Cricket: "板球",
  Football: "足球",
  Golf: "高尔夫",
  Handball: "手球",
  Hockey: "曲棍球",
  "Rugby Sevens": "七人制橄榄球",
  "Soft Tennis": "软式网球",
  Softball: "垒球",
  Squash: "壁球",
  "Table Tennis": "乒乓球",
  Volleyball: "排球",
};
let init_inv = [];
let init_rot = [];
let scale_ratio = 0.003;
let init_position;
let scene = null;

export default {
  data() {
    return {
      poseNameCN: "跆拳道",
      poseNameEN: "Taekwondo",
      posePic: "/pic/cut/pose-09-crop.png",
      poseGif: "/pic/cut/pose-09.gif",
      percentage: 10,
      started: false,
      currentTime: 14,
      preData: {},
      colorArray: [],
      nowColor: "rgb(1,3,4)",
      showEnd: false,
      rankList: [1, 2, 3, 4, 5],
      totalTime: 0,
      // socket = inject("socket"),
    };
  },
  mounted() {
    this.initThree();

    this.colorArray = this.colorArrToString(
      this.colorGradient4(
        [255, 50, 50],
        [255, 153, 49],
        [255, 236, 98],
        [166, 255, 164],
        3056,
        6806,
        10000
      )
    );
    // console.log(this.colorArray);
    this.nowColor = this.colorArray[this.percentage * 100];
    // console.log(this.nowColor);
    this.$socket.on("connect", () => {
      console.log("connect");
      this.$socket.emit("connection", "connected");
    });
    this.$socket.on("disconnect", () => {
      console.log("disconnect");
    });
    this.$socket.on("message", (data) => {
      data = data[0];
      console.log(data);
      // data = JSON.parse(data);

      if (data.started === true) {
        if (this.started === false) {
          this.currentTime = 0;
        }
      }
      this.showEnd = data.end;
      if (this.showEnd === true) {
        setTimeout(() => {
          this.showEnd = false;
          this.totalTime = 0;
        }, 10000);
      }
      this.rankList = data.ranklist;
      this.started = data.started;
      this.percentage = data.percentage;
      this.nowColor = this.colorArray[this.percentage * 100];
      this.poseNameCN = englishToChinese[data.poseID];
      this.poseNameEN = data.poseID;
      this.posePic = this.getPicUrl(data.poseID);
      this.updatePos(data["3dpose"]);
    });
    setInterval(() => {
      if (this.started === true) {
        this.currentTime += 1;
        this.totalTime += 1;
      }
      // if (this.currentTime > 20) {
      //   // this.started = ;
      //   // this.showEnd = true;
      // }
    }, 1000);
  },
  methods: {
    colorGradient2(colorStart, colorEnd, steps) {
      let colorArr = [];
      // console.log(colorStart, colorEnd, steps);
      for (let i = 0; i < steps; i++) {
        colorArr.push([
          Math.floor(
            colorStart[0] + ((colorEnd[0] - colorStart[0]) * i) / steps
          ),
          Math.floor(
            colorStart[1] + ((colorEnd[1] - colorStart[1]) * i) / steps
          ),
          Math.floor(
            colorStart[2] + ((colorEnd[2] - colorStart[2]) * i) / steps
          ),
        ]);
      }
      // console.log(colorArr);
      return colorArr;
    },
    colorGradient4(color1, color2, color3, color4, step1, step2, step3) {
      let colorArr = [];
      colorArr = colorArr.concat(this.colorGradient2(color1, color2, step1));
      colorArr = colorArr.concat(
        this.colorGradient2(color2, color3, step2 - step1)
      );
      colorArr = colorArr.concat(
        this.colorGradient2(color3, color4, step3 - step2 + 1)
      );
      return colorArr;
    },
    colorArrToString(colorArr) {
      return colorArr.map((item) => {
        return `rgb(${item[0]}, ${item[1]}, ${item[2]})`;
      });
    },
    getPicUrl(poseNameEN) {
      return `/pic/cut/${poseNameEN}.png`;
    }, // 获取图片url
    PrefixInteger(num) {
      return (Array(2).join("0") + num).slice(-2);
    },
    initThree() {
      scene = new Scene();
      // scene.background = new THREE.Color("0x00000000");
      const canvas = document.querySelector("#three");
      const loader = new FBXLoader();
      // const loader = new GLTFLoader();

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
      loader.load("/model/unitychan.fbx", (object) => {
      // loader.load("/model/m.gltf", (gltf) => {
      //   let object = gltf.scene;

        // object.scale.set(30, 30, 30);
        object.scale.set(0.02, 0.02, 0.02);
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
        let pos_7 = new Vector3();
        let pos_4 = new Vector3();
        let pos_1 = new Vector3();
        this.GetBoneTransform(7).getWorldPosition(pos_7);
        this.GetBoneTransform(4).getWorldPosition(pos_4);
        this.GetBoneTransform(1).getWorldPosition(pos_1);
        let init_forward = this.TriangleNormal(pos_7, pos_4, pos_1).normalize();
        console.log(init_forward);
        init_position = new Vector3();

        this.GetBoneTransform(0).position.set(0, 0, 0);
        this.GetBoneTransform(0).getWorldPosition(init_position);
        // Test Update
        // scene.updateMatrixWorld(true);
        for (let i = 0; i < 17; i++) {
          if (this.GetBoneTransform(i)) {
            init_rot[i] = new Quaternion().setFromRotationMatrix(
              this.GetBoneTransform(i).matrixWorld
            );
          }
        }
        for (let i = 0; i < bones.length; i++) {
          let b = bones[i];
          let cb = child_bones[i];

          let b_pos = new Vector3();
          let cb_pos = new Vector3();
          this.GetBoneTransform(b).getWorldPosition(b_pos);
          this.GetBoneTransform(cb).getWorldPosition(cb_pos);
          init_inv[b] = this.LookRotation(
            b_pos.sub(cb_pos).normalize(),
            init_forward
          ).invert();
          console.log(init_rot[b]);
          console.log(init_inv[b]);
          // init_inv[b] = new Quaternion().setFromUnitVectors(init_forward, y);
        }
        // this.updatePos(
        //   "17.520359862211492 21.498393851064318 -42.176340380074265 -43.89124856383098 59.15111146258352 -23.905297258430036 -63.93626368490403 2.764834045076873 -218.7684140394839 -24.333191562429285 40.05499037545603 -438.19663341056093 76.01106011155119 -16.15429225286127 -38.17116357886802 61.623875795196206 -74.58036699324838 -253.748550528567 40.802617629187665 -25.806414606224436 -461.38273240882313 20.80750476510115 30.77747806683835 91.94041272911748 -3.7008547232086886 14.98334546022796 249.72462928565363 -28.57944690361432 -28.147954250293942 268.18822914600634 -33.76783930617402 -7.481535000678336 346.2664057660737 70.52920082695036 -19.506839189670806 240.25554389806982 130.0603558599148 -72.24938796744293 126.24172013395527 89.09414865046445 -116.0741528375084 99.87941207427848 -69.96488604702992 60.29500738229508 203.3203990946429 -98.82821874524012 95.78135480758894 58.54642201730239 -129.6987562444719 32.11964411960852 -14.748918102142442"
        // );
      });

      let floorGeometry = new CircleGeometry(1, 128);
      let floorMaterial = new MeshMatcapMaterial({ color: 0xffffff });
      let floor = new Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -0.5 * Math.PI;
      floor.receiveShadow = true;
      floor.position.y = -0.8;
      scene.add(floor);

      const dirLight = new DirectionalLight(0xffffff, 0.6);
      //光源等位置
      dirLight.position.set(-10, 8, -5);
      //可以产生阴影
      dirLight.castShadow = true;
      dirLight.shadow.mapSize = new Vector2(1024, 1024);
      scene.add(dirLight);
      const hemLight = new HemisphereLight(0xffffff, 0xffffff, 0.6);
      hemLight.position.set(0, 48, 0);
      const xHemLight = new HemisphereLight(0xffffff, 0xffffff, 0.6);
      xHemLight.position.set(48, 0, 0);
      scene.add(xHemLight);
      function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const canvasPixelWidth = canvas.width / window.devicePixelRatio;
        const canvasPixelHeight = canvas.height / window.devicePixelRatio;

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
      return scene.getObjectByName(
        "Character1_" + this.GetBoneTransform_text(boneId)
      );
      // return scene.getObjectByName(
      //   "mixamorig" + this.GetBoneTransform_text(boneId)
      // );
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
      // console.log(data);
      let now_pos = [];
      // for (let i = 0; i < data.length; i++) {
      //   now_pos[i] = new Vector3(-data[i][0], data[i][1], -data[i][2]);
      // }
      data = data.split(" ");
      for (let i = 0; i < data.length; i += 3) {
        now_pos[Math.floor(i / 3)] = new Vector3(
          -parseFloat(data[i]),
          parseFloat(data[i + 2]),
          -parseFloat(data[i + 1])
        );
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
        // let now_vec = now_pos[c].clone().sub(now_pos[b]).normalize();
        let vecB = new Vector3();
        let vecC = new Vector3();
        scene.updateMatrixWorld(true);

        this.GetBoneTransform(b).getWorldPosition(vecB);
        this.GetBoneTransform(c).getWorldPosition(vecC);
        console.log("------------------------");

        let faMatrix = new Quaternion().setFromRotationMatrix(
          this.GetBoneTransform(b)
            .matrixWorld.clone()
            .premultiply(this.GetBoneTransform(c).matrix)
            .invert()
        );

        console.log(now_pos[b].clone().sub(now_pos[c]));
        let rot = this.LookRotation(
          now_pos[b].clone().sub(now_pos[c]).normalize(),
          pos_forward
        )
          .multiply(init_inv[b])
          .multiply(init_rot[b])
          .premultiply(faMatrix)
          .normalize();
        console.log(rot);

        this.GetBoneTransform(b).setRotationFromQuaternion(rot);
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

<style scoped>
.bar {
  background: linear-gradient(
    180deg,
    rgb(166, 255, 164) 0%,
    rgb(255, 236, 98) 31.94%,
    rgb(255, 153, 49) 69.44%,
    rgb(255, 50, 50) 100%
  );
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
