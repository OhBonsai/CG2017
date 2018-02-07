let gl,
    renderLoop,
    gCamera = null,
    gCameraCtrl = null;

let vs = `#version 300 es
in vec4 a_position;
in vec3 a_norm;
in vec2 a_uv;

uniform MatTransform {
    mat4 matProjection;
    mat4 matCameraView;
};

uniform mat4 uMVMatrix;

out lowp vec3 color;

void main(void){
    if(a_position.w == 0.) color = vec3(1., 0., 0.);
    else if(a_position.w == 1.0) color = vec3(0., 1., 0.);
    else color = vec3(0., 0., 1.);
    gl_Position = matProjection * matCameraView * uMVMatrix * vec4(a_position.xyz, 1.0); 
}
`;

let fs = `#version 300 es
precision mediump float;

in lowp vec3 color;
out vec4 outColor;

void main(void){
    outColor = vec4(color,1.0);;
}
`;


let onReady = function (){
    gShader = new ShaderBuilder(gl, vs, fs, true)
        .prepareUniforms("uMVMatrix", "mat4")
        .prepareUniformBlock(UBO.Cache["MatTransform"],0);

    gModel = Primitive.Cube24.createModel(gl, "Cube").setPosition(0, .6, 0);
    renderLoop.start()
};

let onRender = function () {
    gl.fClear();
    gCamera.updateViewMatrix();
    UBO.Cache["MatTransform"].update("matCameraView",gCamera.viewMatrix);
    gShader.renderModel(gModel.preRender(),false);
};

function main() {
    gl = glInstance('container').fFitScreen().fClear();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 1, 3);
    gCameraCtrl = new CameraControl(gl, gCamera);

    renderLoop = new RenderLoop(onRender,30);
    UBO.create(gl,"MatTransform",1,[
        {name:"matProjection",type:"mat4"},
        {name:"matCameraView",type:"mat4"}
        /*
         {name:"float01",type:"f"},
         {name:"float02",type:"f"},
         {name:"float03",type:"f"},
         {name:"matProj",type:"mat3"},
         {name:"float04",type:"f"},
         {name:"float05",type:"f"},
         {name:"vec3",type:"vec3"},
         {name:"float06",type:"f"},
         */
    ]);
    UBO.Cache["MatTransform"].update("matProjection",gCamera.projectionMatrix);
    onReady()
}

window.addEventListener("load",function() {
    main();
});


