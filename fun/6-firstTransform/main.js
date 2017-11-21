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
    uniform vec3 uColor[4];
    
    out lowp vec4 color;

    void main(void){
        color = vec4(uColor[int(a_color)], 1.0);
        gl_Position =uMVMatrix * vec4(a_position, 1.0 );
    }
`;

let gl,
    renderLoop,
    gShader = null,
    gModel = null;


class TestShader extends Shader {
    constructor(gl, aryColor) {
        super(gl, vs, fs);

        this.uniformLoc.uColor = gl.getUniformLocation(this.program, "uColor");
        gl.uniform3fv(this.uniformLoc.uColor, new Float32Array(aryColor));
        gl.useProgram(null);
    }
}

let onRender = function () {
    gl.fClear();
    gShader.activate().renderModel(gModel.preRender());
};

function main() {
    gl = glInstance('container').fClear().fSetSize(400, 400);
    gShader = new TestShader(gl, [.8, .8, .8, 1, 0, 0, 0, 1, 0, 0, 0, 1]);// Grey Red Green Blue
    gModel = new Model(Primitive.GridAxis.createGrid(gl))
        .setScale(.8, .8, .8)
        .setRotation(0, 0, 45)
        .setPosition(.8, .8, 0);
    renderLoop = new RenderLoop(onRender).start();
}

main();


