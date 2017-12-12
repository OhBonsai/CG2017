let gl,
    renderLoop,
    gGridShader = null,
    gQuadShader = null,
    gridObj = null,
    quadObj = null,
    gCamera = null,
    gCameraCtrl = null;


class GridShader extends Shader {
    constructor(gl, aryColor) {
        super(gl, gridVS, gridFS);

        this.uniformLoc.uColor = gl.getUniformLocation(this.program, "uColor");
        gl.uniform3fv(this.uniformLoc.uColor, new Float32Array(aryColor));
        gl.useProgram(null);
    }
}

class QuadShader extends Shader{
    constructor(gl, pMatrix){
        super(gl, testVS, testFS);
        this.setPerspective(pMatrix);
        this.mainTexture = -1;
        gl.useProgram(null);
    }

    setTexture(texId){
        this.mainTexture = texId;
        return this
    }

    preRender(){
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.mainTexture);
        this.gl.uniform1i(this.uniformLoc.mainTexture, 0);

        return this
    }
}

let onRender = function () {
    gCamera.updateViewMatrix();
    gl.fClear();
    gGridShader.activate()
        .setCameraMatrix(gCamera.viewMatrix)
        .renderModel(gridObj.preRender());
    gQuadShader.activate()
        .setCameraMatrix(gCamera.viewMatrix)
        .renderModel(quadObj.preRender())
};

function main() {
    gl = glInstance('container').fFitScreen().fClear();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 1, 3);
    gCameraCtrl = new CameraControl(gl, gCamera);
    
    gl.fLoadTexture("tex001", document.getElementById('imgTex1'));

    gGridShader = new GridShader(gl, [.8, .8, .8, 1, 0, 0, 0, 1, 0, 0, 0, 1]);// Grey Red Green Blue
    gGridShader.activate().setPerspective(gCamera.projectionMatrix).deactivate();

    gQuadShader = new QuadShader(gl, gCamera.projectionMatrix);
    
    
    gridObj = Primitive.GridAxis.createModel(gl, false);
    quadObj = Primitive.Quadrel.createModel(gl);

    renderLoop = new RenderLoop(onRender).start();
}

window.addEventListener("load",function() {
    main();
});


