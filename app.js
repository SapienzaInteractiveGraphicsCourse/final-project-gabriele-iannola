import * as THREE from './libs/three/build/three.module.js';
import { GLTFLoader } from './libs/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './libs/three/examples/jsm/controls/OrbitControls.js';
import { DirectionalLightHelper } from './libs/three/src/helpers/DirectionalLightHelper.js';
import { AxesHelper } from './libs/three/src/helpers/AxesHelper.js';
import { TWEEN } from './libs/three/examples/jsm/libs/tween.module.min.js'
import * as Utils from './libs/utils.js'

var gameVariables = {
    DEBUG: true,
    PLAY_TIME: 300,
    WIN_SCORE: 1,
}

var deliveredPackages = 0;
var batteryValue = 100;

var gui = new dat.GUI();


var selPoint = 0;
var bBoxVisible = 0;
var dogJoints = {
    "leg4": 0, "move7": 0, "foot4": 0,
    "leg3": 0, "move": 0, "foot3": 0,
    "leg2": 0, "move4": 0, "move5": 0, "move6": 0,
    "leg1": 0, "move1": 0, "move2": 0, "move3": 0,
    "tail": 0, "body": 0,
    "head": 0, "up": 0, "down": 0, "tongue": 50
};

var runTweenGroup, idleTweenGroup;
var runningAnimationProperties = {
    frames: {
        frame1: {
            "leg4": 40, "move7": -30, "foot4": 30,
            "leg3": 0, "move": -30, "foot3": 30,
            "leg2": -30, "move4": -20, "move5": 20, "move6": 40,
            "leg1": 0, "move1": 0, "move2": 0, "move3": 0,

            "tail": -5, "body": 0,
            "head": 10, "up": 0, "down": 5
        },
        frame2: {
            "leg4": -60, "move7": 0, "foot4": 60,
            "leg3": 40, "move": -30, "foot3": 30,
            "leg2": -10, "move4": -20, "move5": 0, "move6": 0,
            "leg1": -30, "move1": -20, "move2": 40, "move3": 40,

            "tail": 5, "body": 5,
            "head": 0, "up": 0, "down": 10
        },
        frame3: {
            "leg4": -80, "move7": 20, "foot4": 90,
            "leg3": -60, "move": 0, "foot3": 60,
            "leg2": 60, "move4": -20, "move5": 40, "move6": 70,
            "leg1": 10, "move1": 0, "move2": 0, "move3": 0,

            "tail": -5, "body": 0,
            "head": -10, "up": 0, "down": 5
        },
        frame4: {
            "leg4": 0, "move7": -30, "foot4": 30,
            "leg3": -80, "move": 20, "foot3": 90,
            "leg2": 20, "move4": -20, "move5": 0, "move6": 0,
            "leg1": 60, "move1": -20, "move2": 40, "move3": 70,

            "tail": 5, "body": -5,
            "head": 0, "up": 0, "down": 10
        }
    },
    axes: {
        "leg4": 0, "move7": 0, "foot4": 0,
        "leg3": 0, "move": 0, "foot3": 0,
        "leg2": 0, "move4": 0, "move5": 0, "move6": 0,
        "leg1": 0, "move1": 0, "move2": 0, "move3": 0,
        "tail": 2, "body": 0,
        "head": 0, "up": 0, "down": 0
    },
    tweens: [],
    tweenSpeed: [500 / 4, 500 / 4, 500 / 4, 500 / 4]
}

var idleAnimationProperties = {
    frames: {
        frame1: {
            "leg4": 0, "move7": 0, "foot4": 0,
            "leg3": 0, "move": 0, "foot3": 0,
            "leg2": 0, "move4": 0, "move5": 0, "move6": 0,
            "leg1": 0, "move1": 0, "move2": 0, "move3": 0,
            "tail": 20, "body": 0,
            "head": 0, "up": 0, "down": 5, "tongue": 50
        },
        frame2: {
            "leg4": 0, "move7": 0, "foot4": 0,
            "leg3": 0, "move": 0, "foot3": 0,
            "leg2": 0, "move4": 0, "move5": 0, "move6": 0,
            "leg1": 0, "move1": 0, "move2": 0, "move3": 0,
            "tail": 0, "body": -3,
            "head": -3, "up": 0, "down": 8, "tongue": 100
        },
        frame3: {
            "leg4": 0, "move7": 0, "foot4": 0,
            "leg3": 0, "move": 0, "foot3": 0,
            "leg2": 0, "move4": 0, "move5": 0, "move6": 0,
            "leg1": 0, "move1": 0, "move2": 0, "move3": 0,
            "tail": -20, "body": 0,
            "head": 0, "up": 0, "down": 5, "tongue": 50
        },
        frame4: {
            "leg4": 0, "move7": 0, "foot4": 0,
            "leg3": 0, "move": 0, "foot3": 0,
            "leg2": 0, "move4": 0, "move5": 0, "move6": 0,
            "leg1": 0, "move1": 0, "move2": 0, "move3": 0,
            "tail": 0, "body": 3,
            "head": 3, "up": 0, "down": 8, "tongue": 100
        }
    },
    axes: {
        "leg4": 0, "move7": 0, "foot4": 0,
        "leg3": 0, "move": 0, "foot3": 0,
        "leg2": 0, "move4": 0, "move5": 0, "move6": 0,
        "leg1": 0, "move1": 0, "move2": 0, "move3": 0,
        "tail": 2, "body": 0,
        "head": 2, "up": 0, "down": 0, "tongue": 3
    },
    tweens: [],
    tweenSpeed: [500 / 2, 500 / 2, 500 / 2, 500 / 2]
}


var dogBoxHelper, dogBox3;
var cardBox3, cardBoxHelper;
var anchorBox3, anchorBoxHelper;
var houseBoxHelpers = [];
var houseBox3 = [];
var houseCenters = [null, null, null, null, null, null, null,
    new THREE.Vector3(14.826502929687502, 1.29999951171875, 4.340710327148437),

    new THREE.Vector3(4.224515623873705, 2.500002929687501, -16.241349621053242),

    new THREE.Vector3(15.241329711914062, 2.6015561523437505, -13.95047412109375),
    new THREE.Vector3(-5.019078857421838, 1.300001953125005, -13.177295104980466),
    new THREE.Vector3(-13.569443604034273, 2.5874274902343766, -5.73854101505352),

    new THREE.Vector3(-3.0059666748046867, 2.499998046875, 14.119145874023436),

    new THREE.Vector3(-13.508938475692084, 2.566589467773448, -13.918114012433827),

    new THREE.Vector3(14.00606677246094, 2.577151611328125, -5.333100463867188),
    new THREE.Vector3(14.056039055103856, 2.585351769531876, 12.57357834923541),

    new THREE.Vector3(-12.877217163043511, 1.2999990234375005, 6.642443009623262),
    new THREE.Vector3(-13.561354370117188, 1.2999980468750003, 14.238321655273438),
    new THREE.Vector3(6.063547424316406, 1.299998046875, 14.2446982421875),
    null,

    new THREE.Vector3(5.024515623873702, 2.500002929687501, -13.04134962105325),
    new THREE.Vector3(-6.20596667480468, 2.499998046875, 15.019145874023433),
    new THREE.Vector3(16.50606677246094, 2.577151611328125, -6.6331004638671835),
    new THREE.Vector3(11.556039055103865, 2.585351769531876, 13.373578349235407),
];

var houseSizes = [null, null, null, null, null, null, null,
    new THREE.Vector3(4.0364550781250035, 2.600000000000001, 4.08925463867188),

    new THREE.Vector3(4.204630194582437, 5.000000000000006, 4.1324650756227435),

    new THREE.Vector3(5.16795336914063, 5.203108398437502, 4.292383789062505),
    new THREE.Vector3(4.155188964843825, 2.600000000000125, 2.6994700927734367),
    new THREE.Vector3(4.2005129808451915, 5.174853027343756, 4.932226816048464),
    new THREE.Vector3(4.132896728515635, 5.000000000000001, 4.186828857421878),
    new THREE.Vector3(4.091873782453362, 5.133177509765613, 4.157498740244558),
    new THREE.Vector3(2.5138000488281294, 5.154301269531252, 4.943546142578128),
    new THREE.Vector3(2.5489535991456393, 5.170708013378246, 4.075576840596366),
    new THREE.Vector3(2.610190882538079, 2.600000000000003, 4.1747274483571815),
    new THREE.Vector3(4.1364650878906275, 2.6000000000000014, 4.0892521972656315),
    new THREE.Vector3(2.4611295166015617, 2.600000000000001, 3.999998779296874),
    null,

    new THREE.Vector3(2.5046301945824365, 5.000000000000006, 2.4324650756227424),
    new THREE.Vector3(2.332896728515634, 5.000000000000001, 2.4868288574218766),
    new THREE.Vector3(2.4138000488281293, 5.154301269531252, 2.44354614257813),
    new THREE.Vector3(2.348953599145639, 5.170708013378246, 2.4755768405963643),
];


var inc = 0, shift = 0, directionIndex = 0;
var directionsAxes = [new THREE.Vector2(0, 0), new THREE.Vector2(0, 0)];
//cameraDirection, cameraTangent;

var group1Props = {
    scalingValue: 0.05
}

var dogProps = {
    inMovement: false,
    speed: 0.15,
    size: new THREE.Vector3(),
    holdingBox: false,
    rendered: false,
    locked: true
}

var cardboxProps = {
    size: 0.02,
    pickupDistance: 2
}

var anchorProps = {
    size: 1,
    height: 0.05,
    points: [
        new THREE.Vector3(9.5, 0, 10.7),
        new THREE.Vector3(2.1, 0, 14.4),
        new THREE.Vector3(-2.3, 0, 9.5),
        new THREE.Vector3(-13.5, 0, 9.9),
        new THREE.Vector3(13.8, 0, -0.9),
        new THREE.Vector3(-14.7, 0, -1.1),
        new THREE.Vector3(9.4, 0, -13.8),
        new THREE.Vector3(-0.9, 0, -15.8),
        new THREE.Vector3(-9.2, 0, -10.5),
    ],
    lastAnchorChoice: -1,
}

var batteryStates = [
    ["./textures/battery-1.png", "b1"],
    ["./textures/battery-2.png", "b2"],
    ["./textures/battery-3.png", "b3"],
    ["./textures/battery-4.png", "b4"]
]

//creating a scene, camera and renderer

const scene = new THREE.Scene();
//scene.background = new THREE.Color(0x87ceeb)

const loader = new THREE.TextureLoader();
const texture = loader.load(
    'models/skybox/goegap_4k.jpg',
    () => {
        const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
        rt.fromEquirectangularTexture(renderer, texture);
        scene.background = rt.texture;
    });


const aspect = window.innerWidth / window.innerHeight;

const canvas = document.querySelector('#c');

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    //alpha:true
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setSize(window.innerWidth, window.innerHeight);


const clock = new THREE.Clock(false);

var envBox3 = new THREE.Box3()
envBox3.setFromCenterAndSize(new THREE.Vector3(0,0,0),new THREE.Vector3(100,3,100))
var envBoxHelper = null;
if(gameVariables.DEBUG){
    envBoxHelper = new THREE.Box3Helper(envBox3,"#ffffff")
    scene.add(envBoxHelper);
}


var group1 = new THREE.Group();
var dogGroup = new THREE.Group();

if (gameVariables.DEBUG) {
    const axesHelperScene = new AxesHelper(5);
    scene.add(axesHelperScene);
    const axesHelperTest = new AxesHelper(5);
    group1.add(axesHelperTest);
    const gridHelper = new THREE.GridHelper(100, 100);
    scene.add(gridHelper);
}


//scene.add(mesh);
//console.log(mesh)


var camera;
var cameraRadius = 60;

/*
height = 2;
width = aspect * height;
camera = new THREE.OrthographicCamera(-width,width,height,-height,0.1,100);*/

camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
camera.position.set(0, 30, -cameraRadius);
//camera.position.set(-cameraRadius, 0, 0);

window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    //test.position.x = - window.innerWidth * 0.0027;
    //test.position.y = - window.innerHeight * 0.002;
}


const controls = new OrbitControls(camera, canvas);
if (!gameVariables.DEBUG) {
    controls.mouseButtons = { LEFT: 0 }
    controls.maxDistance = cameraRadius;
    controls.minDistance = cameraRadius;
    controls.minPolarAngle = THREE.MathUtils.degToRad(20);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(70);
}



//create a light

var lightFolder = gui.addFolder("Lights")
lightFolder.open();

scene.add(new THREE.AmbientLight(0xffffff, 0.2))

var lightProps = {
    "lightColor": 0xffffff,
    "lightIntensity": 2,
    "distance": 100,
}


const light = new THREE.DirectionalLight(lightProps.lightColor, lightProps.lightIntensity);

light.position.set(lightProps.distance, lightProps.distance, lightProps.distance);
light.castShadow = true;

//Set up shadow properties for the light
var lightShadowCastRange = 10;
light.shadow.camera.top = lightShadowCastRange;
light.shadow.camera.bottom = -lightShadowCastRange;
light.shadow.camera.left = -lightShadowCastRange;
light.shadow.camera.right = lightShadowCastRange;
light.shadow.camera.near = 0.1; // default
light.shadow.camera.far = 500; // default
light.shadow.bias = -0.0005

scene.add(light);

lightFolder.add(light, "intensity", 0, 5, 0.5);

lightFolder.add(light, "castShadow")
lightFolder.add(light.shadow.camera, "near", 0.1, 0.5, 0.1);
lightFolder.add(light.shadow.camera, "far", 0, 500, 1);
lightFolder.add(light.shadow, "bias", -0.002, 0, 0.0001);

var lightHelper = null;
var lightShadowHelper = null;

if (gameVariables.DEBUG) {
    lightHelper = new DirectionalLightHelper(light);
    //scene.add(lightHelper);
    lightShadowHelper = new THREE.CameraHelper(light.shadow.camera);
    scene.add(lightShadowHelper);
}

//#######################################################

const gltfLoader = new GLTFLoader();

//Creating an anchor point
var anchorSolid;
{
    var anchorGeometry = new THREE.BoxGeometry(anchorProps.size, anchorProps.height, anchorProps.size);
    var anchorMaterial = new THREE.MeshBasicMaterial({
        color: "#ffffff"
    })
    anchorSolid = new THREE.Mesh(anchorGeometry, anchorMaterial);
    anchorSolid.position.y = -10;
    scene.add(anchorSolid);

    anchorBox3 = new THREE.Box3().setFromObject(anchorSolid);
    if (gameVariables.DEBUG) {
        anchorBoxHelper = new THREE.BoxHelper(anchorSolid);
        scene.add(anchorBoxHelper);
    }
}

//Creating a box
var cardBox;


const url4 = './models/crate/source/model.gltf'
gltfLoader.load(url4, (gltf4) => {
    cardBox = gltf4.scene;
    cardBox.traverse(function (node) {

        if (node.type === 'Mesh') {
            node.castShadow = true;
            node.receiveShadow = true;
        }

    });


    //console.log(">>ROOT4--",Utils.dumpObject(cardBox).join('\n'));


    cardBox.scale.set(cardboxProps.size, cardboxProps.size, cardboxProps.size);

    cardBox.position.y = -10;


    scene.add(cardBox);

    cardBox3 = new THREE.Box3().setFromObject(cardBox);

    if (gameVariables.DEBUG) {
        cardBoxHelper = new THREE.BoxHelper(cardBox);
        scene.add(cardBoxHelper);
    }

})


//const url = 'models/robotDog/source/robo_dog.gltf';
const url = 'models/test/dog2.gltf'
var root, mainNode;
gltfLoader.load(url, (gltf) => {

    root = gltf.scene;
    root.traverse(function (node) {

        if (node.type === 'Mesh') {
            node.castShadow = true;
            node.receiveShadow = true;
        }

    });

    //console.log(Utils.dumpObject(root).join('\n'));
    //mainNode = root.getObjectByName("GLTF_SceneRootNode");
    //mainNode = root.getObjectByName("RootNode");
    //mainNode = root.getObjectByName("blockbench_export");
    mainNode = root.getObjectByName("Scene");


    //console.log(Utils.dumpObject(mainNode.getObjectByName("Scene")).join('\n'))

    computeCameraDirection();
    group1.add(camera);
    //group1.add(mainNode);

    dogGroup.add(mainNode);
    group1.add(dogGroup);
    group1.scale.set(group1Props.scalingValue, group1Props.scalingValue, group1Props.scalingValue)
    scene.add(group1)

    dogBox3 = new THREE.Box3().setFromObject(dogGroup);
    dogBox3.getSize(dogProps.size);
    //group1.add(dogBox3)
    dogBoxHelper = new THREE.BoxHelper(dogGroup);
    if (gameVariables.DEBUG) scene.add(dogBoxHelper);


    light.target = mainNode;
    //scene.add(root);

    runTweenGroup = new TWEEN.Group();
    idleTweenGroup = new TWEEN.Group();

    createAnimationTweens(runTweenGroup, runningAnimationProperties);


    createAnimationTweens(idleTweenGroup, idleAnimationProperties);

    function createAnimationTweens(group, props) {
        var tween;
        var len = Object.keys(props.frames).length;

        for (let i = 0; i < len; i++) {
            tween = new TWEEN.Tween(dogJoints, group).to(Object.values(props.frames)[i],
                props.tweenSpeed[i]);
            tween.onUpdate(moveParts, props);
            if (i != 0) props.tweens[i - 1].chain(tween);
            props.tweens.push(tween);
        }
        props.tweens[len - 1].chain(props.tweens[0]);

        function moveParts() {
            Object.keys(dogJoints).forEach(part => {
                switch (props.axes[part]) {
                    case 0: {
                        mainNode.getObjectByName(part).rotation.x = THREE.MathUtils.degToRad(dogJoints[part])
                        break;
                    }
                    case 1: {
                        mainNode.getObjectByName(part).rotation.y = THREE.MathUtils.degToRad(dogJoints[part])
                        break;
                    }
                    case 2: {
                        mainNode.getObjectByName(part).rotation.z = THREE.MathUtils.degToRad(dogJoints[part])
                        break;
                    }
                    case 3: {
                        mainNode.getObjectByName(part).scale.z = THREE.MathUtils.degToRad(dogJoints[part])
                        break;
                    }
                }
            });
        }
    }

    setKeyboardControl();

    controls.addEventListener("change", computeCameraDirection);
    //setMouseControl();

    function setKeyboardControl() {
        document.onkeydown = function (e) {

            //console.log("DIFF",cameraDirection,cameraTangent,cameraDirection.dot(cameraTangent));
            //console.log(e);

            //computeCameraDirection();
            if (dogProps.locked) return;
            switch (e.key.toLowerCase()) {
                case "w": {


                    directionIndex = 0;


                    /*
                    group1.position.x += speed * cameraDirection.x
                    group1.position.z += speed * cameraDirection.y*/

                    inc = 1
                    shift = 0
                    dogProps.inMovement = true;
                    controls.target = mainNode.position;
                    //console.log("forward");
                    break;
                }
                case "a": {
                    directionIndex = 1;


                    /*
                    group1.position.x += speed * cameraTangent.x
                    group1.position.z += speed * cameraTangent.y*/

                    inc = 1
                    shift = 1 / 2;
                    dogProps.inMovement = true;
                    controls.target = mainNode.position;
                    //console.log("left");
                    break;
                }
                case "s": {
                    directionIndex = 0;



                    /*
                    group1.position.x -= speed * cameraDirection.x
                    group1.position.z -= speed * cameraDirection.y*/
                    //dogGroup.rotation.y = Math.PI + Math.atan2(cameraDirection.x, cameraDirection.y);

                    inc = -1
                    shift = 1
                    dogProps.inMovement = true;
                    controls.target = mainNode.position;
                    //console.log("back");
                    break;
                }
                case "d": {
                    directionIndex = 1;


                    /*
                    group1.position.x -= speed * cameraTangent.x
                    group1.position.z -= speed * cameraTangent.y
                    dogGroup.rotation.y = 3 * Math.PI / 2 + Math.atan2(cameraDirection.x, cameraDirection.y);*/

                    inc = -1
                    shift = 3 / 2
                    dogProps.inMovement = true;
                    controls.target = mainNode.position;
                    //console.log("right");
                    break;
                }

                //box interaction

                case "f": {
                    if (e.repeat) break;

                    if (dogProps.holdingBox) {
                        scene.add(cardBox);
                        console.log(group1.position);

                        cardBox.scale.set(cardboxProps.size, cardboxProps.size, cardboxProps.size);
                        cardBox.position.set(group1.position.x, group1.position.y + cardboxProps.size / 2, group1.position.z);
                        cardBox3 = new THREE.Box3().setFromObject(cardBox);
                        dogProps.holdingBox = false;
                        console.log("release")

                        if (cardBox3.intersectsBox(anchorBox3)) {
                            console.log("POINT")
                            deliveredPackages += 1;
                            document.getElementById("crateValue").innerHTML = deliveredPackages.toString() + "/" + gameVariables.WIN_SCORE.toString();
                            spawnBoxRandom();
                        }

                    } else {

                        if (group1.position.distanceTo(cardBox.position) > cardboxProps.pickupDistance) break;

                        mainNode.getObjectByName("body").add(cardBox);
                        cardBox.position.set(-3.2, dogProps.size.y / 2.0 * 0.2, -dogProps.size.z / 2.0 * 0.5);
                        cardBox.scale.set(1 / group1Props.scalingValue * cardboxProps.size, 1 / group1Props.scalingValue * cardboxProps.size, 1 / group1Props.scalingValue * cardboxProps.size)
                        dogProps.holdingBox = true;
                        console.log("pick")
                    }

                    break;
                }

                case "g": {

                    console.log(">> SELECTED ", bBoxVisible + 1);
                    houseBoxHelpers[bBoxVisible].visible = false;
                    bBoxVisible = (bBoxVisible + 1) % houseBoxHelpers.length;
                    houseBoxHelpers[bBoxVisible].visible = true;
                    break;
                }

                case "i": {
                    houseSizes[bBoxVisible].x += 0.1;
                    break;
                }
                case "k": {
                    houseSizes[bBoxVisible].x -= 0.1;
                    break;
                }
                case "o": {
                    houseSizes[bBoxVisible].z += 0.1;
                    break;
                }
                case "l": {
                    houseSizes[bBoxVisible].z -= 0.1;
                    break;
                }

                case "arrowup": {
                    houseCenters[bBoxVisible].x += 0.1;
                    break;
                }
                case "arrowdown": {
                    houseCenters[bBoxVisible].x -= 0.1;
                    break;
                }
                case "arrowleft": {
                    houseCenters[bBoxVisible].z += 0.1;
                    break;
                }
                case "arrowright": {
                    houseCenters[bBoxVisible].z -= 0.1;
                    break;
                }

                default: {
                    console.log(e);
                    break;
                }

            }
        }
        document.onkeyup = function (e) {
            switch (e.key.toLowerCase()) {
                case "w": case "a": case "s": case "d": {
                    dogProps.inMovement = false;
                    inc = 0;
                    break;
                }
                default:
            }

        }
    }

    function computeCameraDirection(e) {

        var cameraDirection = new THREE.Vector2(mainNode.position.x - camera.position.x, mainNode.position.z - camera.position.z).normalize();
        directionsAxes[0] = cameraDirection;
        directionsAxes[1] = new THREE.Vector2(1, -cameraDirection.x / cameraDirection.y).normalize().multiplyScalar(cameraDirection.y >= 0 ? 1 : -1);

    }

    //tween1.start();
    runningAnimationProperties.tweens[0].start();
    idleAnimationProperties.tweens[0].start();

    dogProps.rendered = true;

});

const url2 = './models/enviroment/scene.gltf'
var root2, mainNode2
gltfLoader.load(url2, (gltf2) => {
    root2 = gltf2.scene;

    root2.traverse(function (node) {

        if (node.type === 'Mesh') {
            if (node.name != "Plane001_02_-_Default_0") node.castShadow = true;
            node.receiveShadow = true;
        }

    });


    console.log(Utils.dumpObject(root2).join('\n'));
    mainNode2 = root2.getObjectByName("RootNode");

    mainNode2.scale.set(0.008, 0.008, 0.008);
    gltf2.scene.updateMatrixWorld(true)
    mainNode2.children[0].scale.set(3, 3, 3);

    mainNode2.children.filter(x => /(house|Column|Stairs)/.test(x.name)).forEach((obj, ndx) => {

        //console.log("!!",ndx,obj.name,/(020|015|013|012)$/.test(obj.name))

        //obj.scale.set(0.008,0.008,0.008)
        houseBox3[ndx] = new THREE.Box3().setFromObject(obj);

        if (houseCenters[ndx] == null) {
            houseCenters[ndx] = new THREE.Vector3(0, 0, 0);
            houseBox3[ndx].getCenter(houseCenters[ndx]);
            houseSizes[ndx] = new THREE.Vector3(0, 0, 0);
            houseBox3[ndx].getSize(houseSizes[ndx]);
        } else {
            houseBox3[ndx].setFromCenterAndSize(houseCenters[ndx], houseSizes[ndx])
        }


        //obj.scale.set(1,1,1)
        //console.log("--->",houseBox3[ndx].min,houseBox3[ndx].max);
        if (gameVariables.DEBUG) {
            //houseBoxHelpers[ndx] = new THREE.BoxHelper(obj);
            houseBoxHelpers[ndx] = new THREE.Box3Helper(houseBox3[ndx], "#00ff00");
            //houseBoxHelpers[ndx].visible = false;
            scene.add(houseBoxHelpers[ndx]);
        }
    });

    var l = houseBox3.length;

    mainNode2.children.filter(x => /(020|015|013|012)$/.test(x.name)).forEach((obj, ndx) => {

        //console.log("!!",obj.name,/(020|015|013|012)$/.test(obj.name))

        //obj.scale.set(0.008,0.008,0.008)
        houseBox3[l + ndx] = new THREE.Box3().setFromObject(obj);

        if (houseCenters[l + ndx] == null) {
            houseCenters[l + ndx] = new THREE.Vector3(0, 0, 0);
            houseBox3[l + ndx].getCenter(houseCenters[l + ndx]);
            houseSizes[l + ndx] = new THREE.Vector3(0, 0, 0);
            houseBox3[l + ndx].getSize(houseSizes[l + ndx]);
        } else {
            houseBox3[l + ndx].setFromCenterAndSize(houseCenters[l + ndx], houseSizes[l + ndx])
        }


        //obj.scale.set(1,1,1)
        //console.log("--->",houseBox3[ndx].min,houseBox3[ndx].max);
        if (gameVariables.DEBUG) {
            //houseBoxHelpers[ndx] = new THREE.BoxHelper(obj);
            houseBoxHelpers[l + ndx] = new THREE.Box3Helper(houseBox3[l + ndx], "#00ff00");
            //houseBoxHelpers[l+ndx].visible = false;
            scene.add(houseBoxHelpers[l + ndx]);
        }
    });
    if (gameVariables.DEBUG) houseBoxHelpers[bBoxVisible].visible = true;
    mainNode2.position.y -= 0.05;

    scene.add(mainNode2);

    test();
    /*
    houseBox3.shift();
    houseBoxHelpers.shift();*/

})

const url3 = './models/arrow/scene.gltf'
var root3, mainNode3
gltfLoader.load(url3, (gltf3) => {
    root3 = gltf3.scene;

    //console.log(Utils.dumpObject(root3).join('\n'));
    mainNode3 = root3.getObjectByName("RootNode");


    group1.add(mainNode3);
    mainNode3.position.y += 20;
    mainNode3.scale.y = 2
    mainNode3.scale.z *= -1

})



var previousDogPosition = [];

var startButton = document.createElement("INPUT");
startButton.setAttribute("type", "button");
startButton.value = "START";
startButton.id = "gameStartButton";
startButton.onclick = startNewGame;
document.getElementById("container").appendChild(startButton)

var alert = document.getElementsByClassName("alert")[0]
var gameOverText = alert.children[0];
var retryButton = document.createElement("INPUT");
retryButton.setAttribute("type", "button");
retryButton.value = "RETRY";
retryButton.classList.add("retryButton");
retryButton.onclick = resetGame;
alert.appendChild(retryButton);



animate();
//clock.start();

var gameOver;
var stop = false;

function animate() {
    if (stop) return;
    requestAnimationFrame(animate);

    //test();
    controls.update();

    //console.log(">>",clock.getElapsedTime())

    gameOver = timeHandler()

    if (gameOver != undefined) {
        console.log("STOP!")

        if (!gameOver) {
            //alert("You win!")
            gameOverText.innerHTML = "YOU WIN!";
            alert.classList.add("winAlert");
            alert.classList.remove("loseAlert");
            retryButton.classList.add("winButton");
            retryButton.classList.remove("loseButton");
            alert.style.display = "block";
            //resetGame()
        } else {
            //alert("You lose!")
            gameOverText.innerHTML = "YOU LOSE!";
            alert.classList.add("loseAlert");
            alert.classList.remove("winAlert");
            retryButton.classList.add("loseButton");
            retryButton.classList.remove("winButton");
            alert.style.display = "block";

            //resetGame()
        }
        stop = true
    }

    console.log(light.shadow.camera.near)

    if (gameVariables.DEBUG) {
        lightHelper.update();
        lightShadowHelper.update();
        cardBoxHelper.update();
        anchorBoxHelper.update();
        houseBoxHelpers.forEach(helper => {
            //helper.update();
            helper.updateMatrixWorld();
        });
        envBoxHelper.updateMatrixWorld();

    }

    if (dogProps.inMovement) {

        previousDogPosition = [group1.position.x, group1.position.z, dogGroup.rotation.y];
        group1.position.x += inc * dogProps.speed * directionsAxes[directionIndex].x
        group1.position.z += inc * dogProps.speed * directionsAxes[directionIndex].y
        dogGroup.rotation.y = shift * Math.PI + Math.atan2(directionsAxes[0].x, directionsAxes[0].y);
        dogBox3 = new THREE.Box3().setFromObject(group1);
        //console.log(houseBox3);

        if (!envBox3.containsBox(dogBox3)) {
            
            group1.position.x = previousDogPosition[0];
            group1.position.z = previousDogPosition[1];
            dogGroup.rotation.y = previousDogPosition[2];
        } 

        for (var i = 0; i < houseBox3.length; i++) {
            if (dogBox3.intersectsBox(houseBox3[i])) {
                group1.position.x = previousDogPosition[0];
                group1.position.z = previousDogPosition[1];
                dogGroup.rotation.y = previousDogPosition[2];
                break;
            }
        }

        if (gameVariables.DEBUG) dogBoxHelper.update();
    }
    if (dogProps.rendered) dogAnimationHandler();

    console.log("CAMERA POS", camera.position, "\nDOG POS", mainNode.position, "\nGROUP1 POS", group1.position, "\nLIGHT POS", light.position)



    light.shadow.camera.updateProjectionMatrix();
    light.shadow.camera.lookAt(group1.position.x, group1.position.y, group1.position.z);
    camera.updateProjectionMatrix();
    camera.lookAt(group1.position.x, group1.position.y, group1.position.z);

    if (dogProps.locked) group1.remove(mainNode3);
    dogProps.holdingBox ?
        mainNode3.lookAt(anchorSolid.position.x, anchorSolid.position.y, anchorSolid.position.z) :
        mainNode3.lookAt(cardBox.position.x, cardBox.position.y, cardBox.position.z)

    //mainNode3.lookAt(1,1,1);
    //TWEEN.update();

    renderer.render(scene, camera);
}

function dogAnimationHandler() {

    if (dogProps.inMovement) runTweenGroup.update();
    else idleTweenGroup.update();
}

function spawnBoxRandom() {
    var rx, rz;
    do {
        console.log("try");
        rx = THREE.MathUtils.randFloat(-30, 30);
        rz = THREE.MathUtils.randFloat(-30, 30);
        cardBox.position.set(rx, 0, rz);
        cardBox3 = new THREE.Box3().setFromObject(cardBox);
    } while (checkIntersect())

    cardBox.position.y = cardboxProps.size / 2;
    //console.log(cardBox.position);

    function checkIntersect() {
        for (var i = 0; i < houseBox3.length; i++) {
            if (cardBox3.intersectsBox(houseBox3[i])) {
                console.log("fail");
                return true;
            }
        }
    }

    console.log("box positioned at", rx, rz)

    var distance = anchorProps.points.map((point) => cardBox.position.distanceTo(point));
    //var distanceSum = 
    var probDistribution = distance.map((x => x / (distance.reduce(((total, curr) => total + curr), 0))))

    var sortedProb = probDistribution.map((x) => [probDistribution.indexOf(x), x]).sort((a, b) => a[1] - b[1]);
    var r = Math.random();
    console.log("Probs", sortedProb);
    console.log("R", r);
    for (let i = 0; i < sortedProb.length; i++) {
        if (r <= sortedProb[i][1]) {
            console.log(sortedProb[i])
            if (sortedProb[i][0] == anchorProps.lastAnchorChoice) {
                r -= sortedProb[i][1];
                continue;
            }
            anchorProps.lastAnchorChoice = sortedProb[i][0];
            var choice = anchorProps.points[anchorProps.lastAnchorChoice];
            anchorSolid.position.set(choice.x, choice.y, choice.z);
            anchorBox3 = new THREE.Box3().setFromObject(anchorSolid);
            break;
        }
        r -= sortedProb[i][1];
    }
    //console.log("prob",probDistribution)



}

function timeHandler() {
    batteryValue = Math.ceil((gameVariables.PLAY_TIME - clock.getElapsedTime()) / gameVariables.PLAY_TIME * 100);
    var batteryValueObj = document.getElementById("batteryValue");
    batteryValueObj.innerHTML = batteryValue.toString() + "%";

    if (gameVariables.WIN_SCORE - deliveredPackages <= 0) {
        console.log("GAME WIN!")
        deliveredPackages = 0;
        clock.stop();
        return 0;
    }

    if (batteryValue <= 0) {
        console.log("GAME OVER")
        batteryValue = 100;
        clock.elapsedTime = 0;
        clock.stop();
        document.getElementById("batteryDiv").style.display = "none";
        document.getElementById("crateDiv").style.display = "none";
        return 1;
    }
    else {
        var batteryStateIndex = Math.ceil(batteryValue / 25) - 1;
        document.getElementById("batteryImage").src = batteryStates[batteryStateIndex][0];
        batteryValueObj.classList = [batteryStates[batteryStateIndex][1]]
    }

}

function startNewGame() {
    console.log("startGame!")
    deliveredPackages = 0;
    dogProps.locked = false;
    spawnBoxRandom();
    group1.add(mainNode3);
    clock.stop();
    clock.start();
    startButton.style.display = "none";
    document.getElementById("batteryDiv").style.display = "block";
    document.getElementById("crateDiv").style.display = "block";
    document.getElementById("crateValue").innerHTML = deliveredPackages.toString() + "/" + gameVariables.WIN_SCORE.toString();
}

function resetGame() {
    gameOver = undefined;
    document.getElementById("batteryDiv").style.display = "none";
    document.getElementById("crateDiv").style.display = "none";
    startButton.style.display = "block";
    alert.style.display = "none";
    group1.position.x = 0; group1.position.z = 0;
    dogGroup.rotation.y = 0;
    dogProps.locked = true;
    dogProps.inMovement = false;

    if (dogProps.holdingBox) {
        scene.add(cardBox);
        cardBox.scale.set(cardboxProps.size, cardboxProps.size, cardboxProps.size);
        cardBox.position.set(group1.position.x, group1.position.y + cardboxProps.size / 2 - 5, group1.position.z);
        cardBox3 = new THREE.Box3().setFromObject(cardBox);
        dogProps.holdingBox = false;
        console.log("release")
    }

    stop = false;
    animate();

}

function test() {

    /*
    houseBox3.forEach((x,ndx)=>{
        x.expandByVector()
    })*/
    console.log("TEST ON #", bBoxVisible, houseCenters[bBoxVisible], houseSizes[bBoxVisible]);
    houseBox3[bBoxVisible].setFromCenterAndSize(houseCenters[bBoxVisible], houseSizes[bBoxVisible])
}

