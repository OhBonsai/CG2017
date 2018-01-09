let gl,
    renderLoop,
    gSimpleShader = null,
    gObj = null,
    light = null
    gCamera = null,
    gCameraCtrl = null;


class SimpleShader extends Shader {

    constructor(gl, pMatrix){
        super(gl, simpleVS, simpleFS);
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
    // gSimpleShader.activate().preRender()
    //     .setCameraMatrix(gCamera.viewMatrix)
    //     .renderModel(gObj.preRender())
    gObj.render();
};

function main() {
    gl = glInstance('container').fFitScreen().fClear();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 1, 3);
    gCameraCtrl = new CameraControl(gl, gCamera);

    gl.fLoadTexture("tex001", document.getElementById("tex001"), false);
    // gObj = new Model( ObjLoader.textToMesh("objCube",obj_file,true) );
    gObj = new Girl(gl, obj_file);
    gSimpleShader = new SimpleShader(gl, gCamera.projectionMatrix).activate()
        .setTexture(gl.mTextureCache['tex001']);




    renderLoop = new RenderLoop(onRender).start();
}

window.addEventListener("load",function() {
    main();
});


