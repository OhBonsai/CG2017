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
uniform sampler2D uMask_A;
uniform sampler2D uMask_B;
uniform vec3[2] uColors;
in highp vec2 vUV;
out vec4 outColor;

void main(void){
    vec4 mask_a = texture(uMask_A,vUV*3.0) * .5;
    vec4 mask_b = texture(uMask_B,vUV*2.0);
    float c = min(mask_a.r + mask_b.r,1.0);

    outColor = vec4( mix(uColors[0],uColors[1], c), 1.0);
}
`;


let onReady = function (){
    gShader = new ShaderBuilder(gl, vs, fs, true)
        .prepareUniforms(
            "uPMatrix", "mat4",
            "uMVMatrix", "mat4",
            "uCameraMatrix", "mat4",
            "uColors", "3fv")
        .prepareTextures("uMask_A","mask_a","uMask_B","mask_b")
        .setUniforms(
            "uPMatrix", gCamera.projectionMatrix,
            "uColors", glUtil.rgbArray("888800", "000000"));

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
    Resources.setup(gl,onReady).loadTexture(
        "mask_a", "./mask_cornercircles.png",
        "mask_b", "./mask_square.png"
    ).start();
}

window.addEventListener("load",function() {
    main();
});


