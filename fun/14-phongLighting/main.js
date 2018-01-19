let gl,
    renderLoop,
    girl = null,
    light = null,
    gCamera = null,
    gCameraCtrl = null;

let radius = 1.5,
    angle = 0,
    angInc = 1,
    yPos = 0,
    yPosInc = .2;

let onRender = function (dt) {
    gCamera.updateViewMatrix();
    gl.fClear();

    angle += angInc * dt;
    yPos += yPosInc * dt;

    let x = radius * Math.cos(angle);
    let z = radius * Math.sin(angle);
    let y = MathUtil.map(Math.sin(yPos),-1,1,0.1,2);
    light.transform.position.set(x, y, z);


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
    renderLoop = new RenderLoop(onRender, 60).start();
}

window.addEventListener("load",function() {
    main();
});


