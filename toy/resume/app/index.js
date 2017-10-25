/**
 * Created by Bonsai on 17-3-20.
 */
require('./css/main.css');
import {
    renderer, clock, controls, scene, camera, time, oControls,
    englishFont, chineseCopyWriter, chineseFont
} from './env'
import {Light} from './mesh/light';
import {EnglishTextParticles, ChineseTextParticles} from './mesh/textParticles';
import {Tile} from './mesh/tile';
import {Heart} from './mesh/heart';
import {Link} from './mesh/link';


document.addEventListener("DOMContentLoaded", function () {
    init();
    animate();
});

window.onresize = onWindowResize;

let text;
let heart;
let lights1;
let tile;
let light2, light3, light4, light5, light6;
let gitLink, resumeLink;

function init() {
    // voice over
    text = new ChineseTextParticles(chineseCopyWriter, chineseFont, {
        letterWidth: .03,
        lineLength: 50
    });
    text.joinScene();
    text.getParticle().position.x = - text.getParticle().totalWidth / 2;
    text.getParticle().position.z = 0.35;


    // scenario 1: say hello
    heart = new Heart();
    heart.joinScene();
    heart.setPosition(0, .2, 0);

    // scenario 2: my job
    tile = new Tile('./app/gis/');
    tile.setPostion(0,-4.1, -3);
    tile.joinScene();

    // scenario 3: what i learn in current job
    lights1 = [];
    for (let i=0; i<10; i++){
        lights1[i] = new Light(1, .1, 30);
        lights1[i].joinScene();
        let h = - 7.6 - Math.random() * 3.3;
        lights1[i].setPosition((Math.random() - .5) * 3.5, h, -1.0 - Math.random() * 3.5);
        lights1[i].setBWVals(h, h + .3);
        lights1[i].setRayFill(h, h - .3);
    }

    // scenario 4: why i change my job
    light2 = new Light();
    light2.joinScene();
    light2.setPosition(-1.5, -13.5, -1.5);
    light2.setBWVals(-15.5, -15.5 + .3);

    light3 = new Light();
    light3.joinScene();
    light3.setPosition(-.5, -13.5, -1.5);
    light3.setBWVals(-15.5, -15.5 + .3);
    light3.setBreakingShimmer(.02);

    light4 = new Light();
    light4.joinScene();
    light4.setPosition(.5, -13.5, -1.5);

    light5 = new Light();
    light5.joinScene();
    light5.setPosition(1.5, -13.5, -1.5);
    light5.setBWVals(-15.5, -15.5 + .3);

    // scenario 5: thanks
    light6 = new Light(5 , .05 , 200 );
    light6.joinScene();
    light6.setPosition(0 , -14.5);
    light6.setRayFill(-14.5 , -16.5);

    resumeLink = new Link(englishFont, 'Jump to Doc Resume', 'resume.html');
    resumeLink.setPosition(.4, -16.0, 0.);
    resumeLink.joinScene();

    gitLink = new Link(englishFont, 'Source Code, Star Me^_^', 'https://github.com/OhBonsai/resume');
    gitLink.setPosition(.4, -16.2, 0.);
    gitLink.joinScene();

    // change help info
    document.getElementById('help').innerHTML = '滑动滚轮';
}

function animate() {
    requestAnimationFrame(animate);
    time.value += clock.getDelta();
    if (time.value >= 60) time.value = 0;

    heart.update();
    for(let light of lights1){light.update()}
    light2.update();
    light3.update();
    light4.update();
    light5.update();

    light6.update();

    controls.update();
    oControls.update();
    window.localStorage.bonsaiResumeCameraPositionY = camera.position.y;
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


