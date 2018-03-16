/**
 * Created by bonsai on 15/03/18.
 */
const vs = `#version 300 es
		layout(location=0) in vec4 a_position;
		layout(location=1) in vec3 a_norm;
		layout(location=2) in vec2 a_uv;

		uniform UBOTransform{
			mat4 matProjection;
			mat4 matCameraView;
		};

		uniform mat4 uModalMatrix;
		uniform mat3 uNormalMatrix;

		out highp vec2 vUV;
		out lowp vec3 color;

		void main(void){
			if(a_position.w == 0.0) color = vec3(1.0,0.0,0.0);
			else if(a_position.w == 1.0) color = vec3(0.0,1.0,0.0);
			else color = vec3(0.6,0.6,0.6);

			vUV = a_uv;
			gl_Position =  matProjection * matCameraView * uModalMatrix * vec4(a_position.xyz, 1.0);
		}`;
const fs = `#version 300 es
		precision mediump float;
		in highp vec2 vUV;
		in lowp vec3 color;
		out vec4 outColor;

		void main(void){
			outColor = vec4(color,1.0);
		}`;



let gCamera,gCameraCtrl,gRenderList,gRLoop,gDebugLine;
let gLblFPS;


window.addEventListener("load",function(){

    Bonsai.Init("BonsaiCanvas").fClearColor("FFFFFF").fFitScreen(1,1).fClear();

    //.......................................................
    //Setup Camera
    let uboTransform = Bonsai.Shaders.UBO.createTransformUBO();
    gCamera = new Bonsai.CameraOrbit().setPosition(0,0.5,5).setEulerDegrees(-15,45,0);
    gCameraCtrl = new Bonsai.CameraControl(gCamera);

    //.......................................................
    //Create Shaders and Materials
    Bonsai.Shaders.New("TextShader",vs,fs)
        .prepareUniforms(Bonsai.UNI_MODEL_MAT_NAME,"mat4")
        .prepareUniformBlocks(uboTransform,0);

    let mat = Bonsai.Shaders.Material.create("MatShader","TextShader");
    mat.useCulling = false;

    //.......................................................
    //Prepare our Renderables
    let renCube = new Bonsai.Renderable(Bonsai.Primatives.FacedCube(),"MatShader").setPosition(0,0.5,0);
    renCube.visible = true;


    gDebugLine = Bonsai.Debug.Lines.getRenderable();

    let p1 = new Bonsai.Maths.Vec3(),
        p2 = new Bonsai.Maths.Vec3();

    p2.copy( renCube.top(p1) ).add(renCube.position);
    p1.multi(0.5).add(renCube.position);
    gDebugLine.addVector(p1,p2,"00ff00");

    p2.copy( renCube.left(p1) ).add(renCube.position);
    p1.multi(0.5).add(renCube.position);
    gDebugLine.addVector(p1,p2,"ff0000");

    p2.copy( renCube.forward(p1) ).add(renCube.position);
    p1.multi(0.5).add(renCube.position);
    gDebugLine.addVector(p1,p2,"0000ff");

    gDebugLine.update();

    gRenderList = [ Bonsai.Debug.GridFloor.getRenderable(), renCube, gDebugLine ];

    //.......................................................
    //Create and Start Render Loop
    gRLoop = new Bonsai.RenderLoop(onRender).start();

    gLblFPS = document.getElementById("lblFPS");
    setInterval(function(){ gLblFPS.innerHTML = gRLoop.fps; },200);
});

function onRender(dt){
    //.......................................................
    //Run Frame Updates
    gCamera.update();//.setDegY(20 * dt).update();

    //.......................................................
    //Start Rendering
    Bonsai.gl.fClear();
    Bonsai.Render(gRenderList);
}

