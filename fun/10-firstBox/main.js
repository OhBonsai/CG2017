let gl,
    renderLoop,
    gGridShader = null,
    gCubeShader = null,
    gridObj = null,
    cubeObj = null,
    gCamera = null,
    gCameraCtrl = null;


class GridShader extends Shader {
    constructor(gl, aryColor, pMatrix) {
        super(gl, gridVS, gridFS);
        this.setPerspective(pMatrix);
        this.uniformLoc.uColor = gl.getUniformLocation(this.program, "uColor");
        gl.uniform3fv(this.uniformLoc.uColor, new Float32Array(aryColor));
        gl.useProgram(null);
    }
}

class CubeShader extends Shader {
    constructor(gl, pMatrix, aryColor) {
        super(gl, cubeVS, cubeFS);
        this.setPerspective(pMatrix);
        this.uniformLoc.uColor = gl.getUniformLocation(this.program, "uColor");
        gl.uniform3fv(this.uniformLoc.uColor, new Float32Array(aryColor));
        gl.useProgram(null);
    }

    setTime(t){
        this.gl.uniform1f(this.uniformLoc.time, t);
        return this
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
    gCubeShader.activate()
        .preRender()
        .setCameraMatrix(gCamera.viewMatrix)
        .setTime(performance.now())
        .renderModel(cubeObj.preRender())
};

function main() {
    gl = glInstance('container').fFitScreen().fClear();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 1, 3);
    gCameraCtrl = new CameraControl(gl, gCamera);

    gl.fLoadTexture("tex001", document.getElementById('imgTex1'));

    gGridShader = new GridShader(gl, [.8, .8, .8, 1, 0, 0, 0, 1, 0, 0, 0, 1], gCamera.projectionMatrix);// Grey Red Green Blue
    gCubeShader = new CubeShader(
            gl, gCamera.projectionMatrix,
            glUtil.rgbArray('#000000', '#FF0000', '#00FF00', '#FFFF00', '#0000FF', '#FF00FF'),
            gCamera.projectionMatrix)
        .activate()
        .setTexture(gl.mTextureCache['tex001']);


    gridObj = Primitive.GridAxis.createModel(gl, true);
    cubeObj = Primitive.Cube24.createModel(gl);
    cubeObj.addPosition(0, 0, 1);

    renderLoop = new RenderLoop(onRender).start();
}

window.addEventListener("load",function() {
    main();
});


