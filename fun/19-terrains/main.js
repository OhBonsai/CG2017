let gl,
    renderLoop,
    gCamera = null,
    gCameraCtrl = null,
    gPlane = null,
    debugLine = null;


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
out float diffuseAngle;
out highp vec3 posWorld;

const vec3 posLight = vec3(4.0, 3.0, 2.0); 

void main(void){
    int f = int(a_position.w);
    vUV = a_uv.xy * 2.0;
    diffuseAngle = max(dot(a_norm, normalize(posLight-a_position.xyz)), 0.);
    posWorld = (uMVMatrix * vec4(a_position.xyz, 1.)).xyz;
    gl_Position = uPMatrix * uCameraMatrix * uMVMatrix * vec4(a_position.xyz, 1.0); 
}
`;


// 这里计算了在世界空间下的Norm， 然后会让Plane更加突兀一点。为什么能够成功。
// dFdx是对x求偏微商， 对x求一次导数。F(x)是从哪里得来的。有一些细节。首先GPU是如何运作的。GPU是一个多核多线程/进程的并发模型。
// 每个Core有独立的寄存器。不能互相访问到，所以F(x)是如何得出来的？
// 进行Fragment计算的时候，将面分给不同的Thread去处理，但是实际上2*2的方块经常性的放到一个线程中计算。所以每个点，很容易得到
// 周边点的值，也就是说。这样可以有多个点构成一个函数。实际上dFdx就是用临近点减去当前点获得一个值。
// 即dFdx(p(x ,y)) = p(x+1, y) - p(x, y)。没错这就是求导--@
// 大概就是这个意思。。。 我也不大懂--！
// 该算法http://www.aclockworkberry.com/shader-derivative-functions/ 在这里详细
let fs = `#version 300 es
precision mediump float;

in highp vec2 vUV;
in float diffuseAngle;
in highp vec3 posWorld;

out vec4 outColor;

const vec3 lightColor = vec3(0., 1., 0.);
const vec3 baseColor = vec3(1., 0., 0.);
const vec3 posLight = vec3(4.0, 3.0, 2.0); 

void main(void){
    vec3 genNorm = normalize(cross(dFdx(posWorld), dFdy(posWorld)));  //Calc new Normals based on World Pos
    float diffAngle = max(dot(genNorm, normalize(posLight-posWorld)), 0.0);	//Calc angle of line
    outColor = vec4(baseColor + lightColor * diffAngle,1.0); 
    // vec3 finalColor = baseColor + diffuseAngle * lightColor;
    // outColor = vec4(finalColor, 1.);
}
`;


let onReady = function (){
    gShader = new ShaderBuilder(gl, vs, fs, true)
        .prepareUniforms(
            "uPMatrix", "mat4",
            "uMVMatrix", "mat4",
            "uCameraMatrix", "mat4")
        .setUniforms("uPMatrix", gCamera.projectionMatrix);

    gPlane = Terrain.createModel(gl, true).setPosition(0, .6, 0);
    debugLine = new LineDebugger(gl).addColor("#000000").addMeshNormal(0, 0.3, gPlane.mesh).finalize();

    renderLoop.start()
};

let onRender = function () {
    gl.fClear();
    gCamera.updateViewMatrix();
    gShader.preRender("uCameraMatrix",gCamera.viewMatrix).renderModel(gPlane.preRender(),false);
    debugLine.render(gCamera);
};

function main() {
    gl = glInstance('container').fFitScreen().fClear();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 1, 3);
    gCameraCtrl = new CameraControl(gl, gCamera);

    renderLoop = new RenderLoop(onRender,30);
    onReady();
}

window.addEventListener("load",function() {
    main();
});


