let gl,
    renderLoop,
    girl = null,
    light = null,
    gCamera = null,
    gCameraCtrl = null;



let onRender = function () {
    gCamera.updateViewMatrix();
    gl.fClear();
    girl.render(gCamera);
    light.render(gCamera);
};

function main() {
    gl = glInstance('container').fFitScreen().fClear();

    gCamera = new Camera(gl);
    gCamera.transform.position.set(0, 1, 3);
    gCameraCtrl = new CameraControl(gl, gCamera);

    girl = new Girl(gl, obj_file).finalize().setTexture("tex001");
    light = new VertexDebugger(gl,10)
        .addColor("#ff0000")
        .addPoint(0,0,0,0)
        .finalize();
    renderLoop = new RenderLoop(onRender).start();
}

window.addEventListener("load",function() {
    main();
});


