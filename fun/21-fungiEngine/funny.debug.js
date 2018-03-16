/**
 * Created by bonsai on 15/03/18.
 */
Bonsai.Debug = {};


Bonsai.Debug.GridFloor = class {

    static  getRenderable() {
        if (Bonsai.Debug.GridFloor.renderable) return Bonsai.Debug.GridFloor.renderable;

        let material = Bonsai.Debug.GridFloor.buildMaterialShader(),
            mesh = Bonsai.Debug.GridFloor.buildMesh()


    }

}

//Singleton Class for creating the GridFloor.
Bonsai.Debug.GridFloor = class {
    static getRenderable() {
        if (Bonsai.Debug.GridFloor.renderable) return Bonsai.Debug.GridFloor.renderable;

        let material = Bonsai.Debug.GridFloor.buildMaterialShader(),
            mesh = Bonsai.Debug.GridFloor.buildMesh();

        Bonsai.Debug.GridFloor.renderable = new Bonsai.Renderable(mesh, "BonsaiGridFloor");
        return Bonsai.Debug.GridFloor.renderable;
    }

    static buildMaterialShader() {
        let vShader = '#version 300 es\n' +
            'layout(location=0) in vec4 a_position;' +
            'uniform UBOTransform{ mat4 matProjection; mat4 matCameraView; };' +
            'uniform mat4 uModalMatrix;' +
            'void main(void){ gl_Position = matProjection * matCameraView * uModalMatrix * vec4(a_position.xyz, 1.0); }';
        let fShader = '#version 300 es\n' +
            'precision mediump float;' +
            'out vec4 finalColor;' +
            'void main(void){ finalColor = vec4(0.8,0.8,0.8,1.0); }';

        Bonsai.Shaders.New("BonsaiGridFloor", vShader, fShader)
            .prepareUniforms(Bonsai.UNI_MODEL_MAT_NAME, "mat4")
            .prepareUniformBlocks(Bonsai.Res.Ubo[Bonsai.UBO_TRANSFORM], 0);

        let mat = Bonsai.Shaders.Material.create("BonsaiGridFloor", "BonsaiGridFloor");
        mat.drawMode = Bonsai.gl.LINES;
        return
    }

    static buildMesh() {
        //Dynamiclly create a grid
        let verts = [],
            size = 30,			// W/H of the outer box of the grid, from origin we can only go 1 unit in each direction, so from left to right is 2 units max
            div = 60.0,			// How to divide up the grid
            step = size / div,	// Steps between each line, just a number we increment by for each line in the grid.
            half = size / 2;	// From origin the starting position is half the size.

        let p;	//Temp letiable for position value.
        for (let i = 0; i <= div; i++) {
            //Vertical line
            p = -half + (i * step);
            verts.push(p, 0, half, p, 0, -half);
            //Horizontal line
            p = half - (i * step);
            verts.push(-half, 0, p, half, 0, p);
        }

        return Bonsai.Shaders.VAO.standardMesh("BonsaiGridFloor", 3, verts, null, null, null, false);
    }
};


Bonsai.Debug.Lines = class {
    static getRenderable() {
        if (Bonsai.Debug.Lines.renderable) return Bonsai.Debug.Lines.renderable;

        //......................................
        //CREATE SHADER
        let vShader = '#version 300 es\n' +
            'layout(location=0) in vec4 a_position;' +
            'uniform UBOTransform{ mat4 matProjection; mat4 matCameraView; };' +
            'uniform vec3 uColorAry[20];' +
            'out lowp vec4 color;' +
            'void main(void){' +
            'color = vec4(uColorAry[ int(a_position.w) ],1.0);' +
            'gl_Position = matProjection * matCameraView * vec4(a_position.xyz, 1.0); ' +
            '}';

        let fShader = '#version 300 es\n precision mediump float; in vec4 color; out vec4 finalColor; void main(void){ finalColor = color; }';

        Bonsai.Shaders.New("BonsaiDebugLine", vShader, fShader)
            .prepareUniforms("uColorAry", "vec3")
            .prepareUniformBlocks(Bonsai.Res.Ubo[Bonsai.UBO_TRANSFORM], 0);

        //......................................
        //CREATE MATERIAL
        let mat = Bonsai.Shaders.Material.create("BonsaiDebugLine", "BonsaiDebugLine");
        mat.useModelMatrix = false;
        mat.drawMode = Bonsai.gl.LINES;

        //......................................
        //CREATE RENDERABLE
        let ren = new Bonsai.Debug.Lines();
        ren.material = mat;
        return Bonsai.Debug.Lines.renderable = ren;
    }

    constructor() {
        this._colorList = [];
        this._colorArray = [];
        this._verts = [];
        this._isModified = true;
        this._bufSize = Float32Array.BYTES_PER_ELEMENT * 8 * 100; //8Floats per line

        this.vao = {};
        this.visible = true;
        this.material = null;

        //Create VAO with a buffer with space for 100 lines.
        Bonsai.Shaders.VAO.create(this.vao)
            .emptyFloatArrayBuffer(this.vao, "vert", this._bufSize, Bonsai.ATTR_POSITION_LOC, 4, 0, 0, false, false)
            .finalize(this.vao, "BonsaiDebugLines");
        this.vao.count = 0;
    }

    update() {
        if (!this._isModified) return;

        //If there is no verts, set this to invisible to disable rendering.
        this._isModified = false;
        if (this._verts.length == 0) {
            this.visible = false;
            return;
        }
        this.visible = true;

        //Calc how many vec4 elements we have
        this.vao.count = this._verts.length / 4;

        //Push verts to GPU.
        Bonsai.gl.bindBuffer(Bonsai.gl.ARRAY_BUFFER, this.vao.buffers["vert"].buf);
        Bonsai.gl.bufferSubData(Bonsai.gl.ARRAY_BUFFER, 0, new Float32Array(this._verts), 0, null);
        Bonsai.gl.bindBuffer(Bonsai.gl.ARRAY_BUFFER, null);

        //Update Uniform
        this.material.shader.activate();
        this.material.shader.setUniforms("uColorAry", this._colorArray);
        this.material.shader.deactivate();
    }

    reset() {
        this._verts.length = 0;
        this._colorArray.length = 0;
        this._colorList.length = 0;
        this.vao.count = 0;
        this._isModified = true;
    }

    addVector(v1, v2, color) {
        let idx = this.addColor(color);
        this._verts.push(v1[0], v1[1], v1[2], idx, v2[0], v2[1], v2[2], idx);
        this._isModified = true;
    }

    addColor(c) {
        if (c[0] == "#") c = c.substring(1);
        c = c.toLowerCase();

        let idx = this._colorList.indexOf(c);
        if (idx != -1) return idx;

        this._colorArray.push(parseInt(c[0] + c[1], 16) / 255.0, parseInt(c[2] + c[3], 16) / 255.0, parseInt(c[4] + c[5], 16) / 255.0);
        this._colorList.push(c);
        return this._colorList.length - 1;
    }
};
