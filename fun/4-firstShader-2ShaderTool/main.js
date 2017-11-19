const fs = `#version 300 es
    precision mediump float;

    uniform float uPointSize;

    out vec4 finalColor;
    
    void main(void){
        float c = (40.0 - uPointSize) / 20.0; 
        finalColor = vec4(c, c, c, 1.0);
    }
`;

const vs = `#version 300 es
    in vec3 a_position;
    
    uniform mediump float uPointSize;
    uniform float uAngle;

    void main(void){
        gl_PointSize = uPointSize;
        //gl_Position = vec4(a_position, 1.0);
        gl_Position = vec4(
            cos(uAngle) * 0.8 + a_position.x,
            sin(uAngle) * 0.8 + a_position.y,
            a_position.z, 1.0 );
    }
`;

let gl,
    renderLoop,
    gShader = null,
    gModel = null;


let gPointSize = 0,
    gAngle = 0,
    gPSizeStep = 3,
    gAngleStep = (Math.PI / 180.) * 90;


class TestShader extends Shader{
    constructor(gl){
        super(gl, vs, fs);

        this.uniformLoc.uPointSize = gl.getUniformLocation(this.program, "uPointSize");
        this.uniformLoc.uAngle     = gl.getUniformLocation(this.program, "uAngle");
        gl.useProgram(null);
    }

    set(size, angle){
        this.gl.uniform1f(this.uniformLoc.uPointSize, size);
        this.gl.uniform1f(this.uniformLoc.uAngle, angle);
        return this;
    }
}

let onRender = function(dt){
    gl.fClear();
    gShader.activate().set(
        (Math.sin( gPointSize += gPSizeStep * dt) * 10.0) + 30.0,
        (gAngle += gAngleStep * dt)
    ).renderModel(gModel);
};

function main(){
    gl = glInstance('container').fClear().fSetSize(400, 400);
    gShader = new TestShader(gl);
    
    let mesh = gl.fCreateMeshVAO("dots", null, [
         0,    0,    0,
         0.1,  0.1,  0,
         0.1, -0.1,  0,
        -0.1, -0.1,  0,
        -0.1,  0.1,  0]);
    mesh.drawMode = gl.POINTS;
    
    gModel = new Model(mesh);
    renderLoop = new RenderLoop(onRender).start();
}

main();


