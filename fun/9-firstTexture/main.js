const fs = `#version 300 es
    precision mediump float;

    in lowp vec4 color;
    out vec4 finalColor;
    
    void main(void){
        finalColor = color;
    }
`;


// layout是3.0的语法，提前预设好uniform的位置。以前都是getUniformLocation(xx)，返回一个值。
// 不过好像getUniformLocation也是按照你代码顺序，uniformLocation从1慢慢排的
const vs = `#version 300 es
    in vec3 a_position;
    layout(location=5) in float a_color;
    
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    uniform mat4 uCameraMatrix;
    uniform vec3 uColor[4];
    
    out lowp vec4 color;

    void main(void){
        color = vec4(uColor[int(a_color)], 1.0);
        gl_Position =uPMatrix * uCameraMatrix * uMVMatrix * vec4(a_position, 1.0 );
    }
`;

let gl,
    renderLoop,
    gShader = null,
    gridObj = null,
    cubeObj = null,
    gCamera = null,
    gCameraCtrl = null;


class TestShader extends Shader {
    constructor(gl, aryColor) {
        super(gl, vs, fs);

        this.uniformLoc.uColor = gl.getUniformLocation(this.program, "uColor");
        gl.uniform3fv(this.uniformLoc.uColor, new Float32Array(aryColor));
        gl.useProgram(null);
    }
}

let onRender = function () {
    gCamera.updateViewMatrix();
    gl.fClear();
    gShader.activate()
        .setCameraMatrix(gCamera.viewMatrix)
        .renderModel(gridObj.preRender());
};

function main() {
    gl = glInstance('container').fFitScreen(.65, .6).fClear();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 1, 3);
    gCameraCtrl = new CameraControl(gl, gCamera);
    
    gl.fLoadTexture("tex001", document.getElementById('imgTex1'));

    gShader = new TestShader(gl, [.8, .8, .8, 1, 0, 0, 0, 1, 0, 0, 0, 1]);// Grey Red Green Blue
    gShader.activate().setPerspective(gCamera.projectionMatrix).deactivate();

    gridObj = Primitive.GridAxis.createModel(gl);
    cubeObj = Primitive.Cuboid.createModel(gl);
    cubeObj.setPosition(0., 0., 6.);

    renderLoop = new RenderLoop(onRender).start();
}

main();


