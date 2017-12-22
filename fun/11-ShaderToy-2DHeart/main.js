let gl,
    renderLoop,
    toyShader=null,
    quad=null,
    gCamera = null,
    gCameraCtrl = null;

class ToyShader extends Shader {
    constructor(gl, pMatrix) {
        super(gl, toyVS, toyFS);
        this.setPerspective(pMatrix);
        this.setTime(performance.now() / 1000.);
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
        return this
    }
}


let onRender = function () {
    gCamera.updateViewMatrix();
    gl.fClear();
    toyShader.activate()
        .setCameraMatrix(gCamera.viewMatrix)
        .setTime(performance.now() / 1000.)
        .renderModel(quad.preRender());

};

function main() {
    gl = glInstance('container').fFitScreen().fClear();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 0, 1.5);
    gCameraCtrl = new CameraControl(gl, gCamera);

    toyShader = new ToyShader(gl, gCamera.projectionMatrix);
    quad = Primitive.Quadrel.createModel(gl);


    renderLoop = new RenderLoop(onRender).start();
}

window.addEventListener("load",function() {
    main();
});


