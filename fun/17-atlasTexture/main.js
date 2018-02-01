let gl,
    renderLoop,
    gCamera = null,
    gCameraCtrl = null,
    cubeMesh = null,
    gCubes = [],
    // LoadTexture Default this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, false);
    // 所以坐标是左上
    texMap = [
        [8,0, 8,0, 8,0, 8,0, 8,0, 8,0],
        [3,0, 3,0, 3,0, 3,0, 3,0, 3,0],			//GrassDirt
        [4,1, 4,1, 4,1, 5,1, 4,1, 5,1],			//Log
        [11,1, 10,1, 10,1, 9,1, 10,1, 9,1],		//Chest
        [7,7, 6,7, 6,7, 6,7, 6,7, 6,6],			//Pumpkin
        [8,8, 8,8, 8,8, 9,8, 8,8, 9,8],			//WaterMelon
    ];


let vs = `#version 300 es
in vec4 a_position;
in vec3 a_norm;
in vec2 a_uv;

uniform mat4 uPMatrix;
uniform mat4 uMVMatrix;
uniform mat4 uCameraMatrix;
uniform vec2[6] uFaces;

const float size = 1./16.;

out highp vec2 vUV;

void main(void){
    int f = int(a_position.w);
    vUV = vec2(uFaces[f].x * size + a_uv.x * size, uFaces[f].y * size + a_uv.y * size);
    gl_Position = uPMatrix * uCameraMatrix * uMVMatrix * vec4(a_position.xyz, 1.0); 
}
`;

let fs = `#version 300 es
precision mediump float;
uniform sampler2D uAltas;

in highp vec2 vUV;
out vec4 outColor;

void main(void){
    outColor = texture(uAltas, vUV);
}
`;


let onReady = function (){
    gShader = new ShaderBuilder(gl, vs, fs, true)
        .prepareUniforms(
            "uPMatrix", "mat4",
            "uMVMatrix", "mat4",
            "uCameraMatrix", "mat4",
            "uFaces", "2fv")
        .prepareTextures("uAltas","altas")
        .setUniforms("uPMatrix", gCamera.projectionMatrix);

    cubeMesh = Primitive.Cube24.createMesh(gl, "Cube", 1, 1, 1, 0, 0, 0, false);
    for(let i=0; i<6; i++){
        gCubes.push(new Model(cubeMesh).setPosition( (i%3)*2 , 0.6 , Math.floor(i/3) * -2))
    }

    renderLoop.start()
};

let onRender = function () {
    gl.fClear();
    gCamera.updateViewMatrix();
    gShader.preRender("uCameraMatrix",gCamera.viewMatrix);
    for(let i=0; i<6; i++){
        gShader.setUniforms("uFaces", texMap[i])
            .renderModel(gCubes[i].preRender(),false)
    }
};

function main() {
    gl = glInstance('container').fFitScreen().fClear();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 1, 3);
    gCameraCtrl = new CameraControl(gl, gCamera);

    renderLoop = new RenderLoop(onRender,30);
    Resources.setup(gl,onReady).loadTexture(
        "altas", "./atlas_mindcraft.png"
    ).start();
}

window.addEventListener("load",function() {
    main();
});


