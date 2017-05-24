/**
 * Created by bonsai on 3/19/17.
 */
const T = require('three');
import {ScrollControl} from './control/scrollControl';
// import {TrackballControls} from './control/trackballControls';
import {ObjectControls} from './control/objectControl';
import {EnglishFont} from './font/english';
import {ChineseFont} from './font/chinese';
import {chineseDoc} from './copywriter/chinese';


var w = window.innerWidth;
var h = window.innerHeight;

const camera = new T.PerspectiveCamera(65, w / h, .001, 10);
if(window.localStorage.bonsaiResumeCameraPositionY){
    camera.position.y = parseInt(window.localStorage.bonsaiResumeCameraPositionY);
}
camera.position.z = 1;



const scene = new T.Scene();
const clock = new T.Clock(true);

let dpr = window.devicePixelRatio || 1;
const renderer = new T.WebGLRenderer();
renderer.setPixelRatio(dpr);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const time = {type: 'f', value: 0.};

const englishFont = EnglishFont('./app/font/PTMono.png');
const chineseFont = ChineseFont('./app/font/chinese.png');
const chineseCopyWriter = chineseDoc;

const controls = new ScrollControl(camera, {
    dampening: .95,
    minPos: -16.1,
    maxPox: 0,
    multiplier: .000003 * 30
});
const oControls = new ObjectControls(camera);
// const dControls = new TrackballControls(camera, renderer.domElement);

export {
    renderer, clock, controls, scene, camera, time, oControls,
    englishFont, chineseCopyWriter, chineseFont
}