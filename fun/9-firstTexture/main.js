let gl,
    renderLoop,
    gGridShader = null,
    gQuadShader = null,
    gSimpleShader = null,
    gridObj = null,
    quadObj = null,
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

class TestShader extends Shader {
    constructor(gl, pMatrix) {
        super(gl, testVS, testFS);
        this.setPerspective(pMatrix);
        gl.useProgram(null);
    }
}

class QuadShader extends Shader{
    constructor(gl, pMatrix){
        super(gl, quadVS, quadFS);
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
    // 这里由于没有写PreRender导致Texture一直没有传入shader中，报的错误也是
    // 没有Buffer绑定Texture0。前几天已经定位到这个问题，看到preRender里面已经写uniform1i,但是没有看这个函数有没有调用。
    // 唉--！
    gQuadShader.activate()
        .preRender()
        .setCameraMatrix(gCamera.viewMatrix)
        .renderModel(quadObj.preRender())
};

function main() {
    gl = glInstance('container').fFitScreen().fClear();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 1, 3);
    gCameraCtrl = new CameraControl(gl, gCamera);

    gl.fLoadTexture("tex001", document.getElementById('imgTex1'));

    gGridShader = new GridShader(gl, [.8, .8, .8, 1, 0, 0, 0, 1, 0, 0, 0, 1], gCamera.projectionMatrix);// Grey Red Green Blue
    gQuadShader = new QuadShader(gl, gCamera.projectionMatrix).activate().setTexture(gl.mTextureCache['tex001']);
    gSimpleShader = new TestShader(gl, gCamera.projectionMatrix);


    gridObj = Primitive.GridAxis.createModel(gl, true);
    quadObj = Primitive.Quadrel.createModel(gl);

    renderLoop = new RenderLoop(onRender).start();
}

window.addEventListener("load",function() {
    main();
});


