let gl,
    renderLoop,
    gGridShader = null,
    gCubeMapShader = null,
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

class CubeMapShader extends Shader {
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
    gCubeMapShader.activate()
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

    gl.fLoadCubeMap("skybox01",[
        document.getElementById("cube01_right"),document.getElementById("cube01_left"),
        document.getElementById("cube01_top"),document.getElementById("cube01_bottom"),
        document.getElementById("cube01_back"),document.getElementById("cube01_front")
    ]);

    gl.fLoadCubeMap("skybox02",[
        document.getElementById("cube02_right"),document.getElementById("cube02_left"),
        document.getElementById("cube02_top"),document.getElementById("cube02_bottom"),
        document.getElementById("cube02_back"),document.getElementById("cube02_front")
    ]);

    cubeObj = Primitive.Cube24.createModel(gl, 'cubeMap', 10, 10, 10, 0, 0, 0);
    gCubeMapShader = new CubeMapShader(

    );

    gridObj = Primitive.GridAxis.createModel(gl, true);
    gGridShader = new GridShader(gl, [.8, .8, .8, 1, 0, 0, 0, 1, 0, 0, 0, 1], gCamera.projectionMatrix);// Grey Red Green Blue

    renderLoop = new RenderLoop(onRender).start();
}

window.addEventListener("load",function() {
    main();
});


