let gl,
    renderLoop,
    gCamera = null,
    gCameraCtrl = null;

let vs = `#version 300 es
in vec4 a_position;
in vec3 a_norm;
in vec2 a_uv;

uniform mat4 uPMatrix;
uniform mat4 uMVMatrix;
uniform mat4 uCameraMatrix;
out highp vec2 vUV;

void main(void){
    vUV = a_uv;
    gl_Position = uPMatrix * uCameraMatrix * uMVMatrix * vec4(a_position.xyz, 1.0); 
}
`;

let fs = `#version 300 es
precision mediump float;
uniform sampler2D uTexture;
in highp vec2 vUV;
out vec4 outColor;

void main(void){
    outColor = texture(uTexture,vUV*1.5);
}
`;


let onReady = function (){
    gShader = new ShaderBuilder(gl, vs, fs, true)
        .prepareUniforms(
            "uPMatrix", "mat4",
            "uMVMatrix", "mat4",
            "uCameraMatrix", "mat4")
        .prepareTextures("uTexture", "tex001")
        .setUniforms("uPMatrix", gCamera.projectionMatrix);

    gModel = Primitive.Cube24.createModel(gl, "Cube").setPosition(0, .6, 0);
    renderLoop.start()
};

let onRender = function () {
    gl.fClear();
    gCamera.updateViewMatrix();
    gShader.preRender("uCameraMatrix",gCamera.viewMatrix)
        .renderModel(gModel.preRender(),false);
};

function main() {
    gl = glInstance('container').fFitScreen().fClear();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 1, 3);
    gCameraCtrl = new CameraControl(gl, gCamera);

    renderLoop = new RenderLoop(onRender,30);
    Resources.setup(gl,onReady).loadTexture("tex001","./UV_Grid_Lrg.jpg").start();
}

window.addEventListener("load",function() {
    main();
});


