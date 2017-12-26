let gl,
    renderLoop,
    gSimpleShader = null,
    gObj = null,
    gCamera = null,
    gCameraCtrl = null;


let onRender = function () {
    gCamera.updateViewMatrix();
    gl.fClear();
    gSimpleShader.activate().preRender()
        .setCameraMatrix(gCamera.viewMatrix)
        .renderModel(gObj.preRender())
};


class SimpleShader extends Shader {

    constructor(gl, pMatrix){
        super(gl, simpleVS, simpleFS);

        this.setPerspective(pMatrix);
        this.mainTexture = -1;
        gl.useProgram(null);
    }

    setTexture(texID){ this.mainTexture = texID; return this; }

    //Override
    preRender(){
        //Setup Texture
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.mainTexture);
        this.gl.uniform1i(this.uniformLoc.mainTexture, 0);

        return this;
    }

}
function main() {
    gl = glInstance('container').fFitScreen().fClear();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 1, 3);
    gCameraCtrl = new CameraControl(gl, gCamera);

    gl.fLoadTexture("tex001", document.getElementById("tex001"));
    gObj = new Model(ObjLoader.textToMesh("girl", obj_file, true));
    gObj .setPosition(0,0,0).setScale(0.5,0.5,0.5);
    gSimpleShader = new SimpleShader(gl, gCamera.viewMatrix).activate()
        .setTexture(gl.mTextureCache['tex001']);

    renderLoop = new RenderLoop(onRender).start();
}

window.addEventListener("load",function() {
    main();
});


