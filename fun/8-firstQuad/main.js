const fs = `#version 300 es
    precision mediump float;
    
    in vec2 uv;
    
    out vec4 finalColor;
    
    void main(void){
        float c = (uv.x <= .1 || uv.x >=.9 || uv.y <= .1 || uv.y >= .9) ? 0. : 1.;
        finalColor = vec4(c, c, c, 1.0-c);
    }
`;


// layout是3.0的语法，提前预设好uniform的位置。以前都是getUniformLocation(xx)，返回一个值。
// 不过好像getUniformLocation也是按照你代码顺序，uniformLocation从1慢慢排的
const vs = `#version 300 es
    in vec3 a_position;
    in vec2 a_uv;
    layout(location=5) in float a_color;
    
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    uniform mat4 uCameraMatrix;
    
    out vec2 uv;

    void main(void){
        uv = a_uv;
        gl_Position =uPMatrix * uCameraMatrix * uMVMatrix * vec4(a_position, 1.0 );
    }
`;

let gl,
    renderLoop,
    gShader = null,
    gModel = null,
    gModel2 = null,
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
        .renderModel(gModel.preRender());
};

function main() {
    gl = glInstance('container').fClear().fSetSize(400, 400);

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 1, 3);
    gCameraCtrl = new CameraControl(gl, gCamera);

    gShader = new TestShader(gl, [.8, .8, .8, 1, 0, 0, 0, 1, 0, 0, 0, 1]);// Grey Red Green Blue
    gShader.activate().setPerspective(gCamera.projectionMatrix).deactivate();

    gModel = Primitive.Quadrel.createModel(gl);
    gModel.setPosition(0,1,0).setScale(0.2,0.2,0.2);

    gModel2 = new Model(gl.mMeshCache["Quad"]); //Extra, Show 2 modals sharing one mesh

    renderLoop = new RenderLoop(onRender).start();
}

main();


