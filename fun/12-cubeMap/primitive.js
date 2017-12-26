/**
 * Created by bonsai on 20/11/17.
 */
const Primitive = {};

Primitive.GridAxis = class {

    static createModel(gl, incAxis = true) {
        return new Model(Primitive.GridAxis.createMesh(gl, incAxis));
    }

    static createMesh(gl, incAxis = true, s = 1.8, d = 10.0) {
        let verts = [],
            size = s,
            div = d,
            step = size / div,
            half = size / 2;

        let p;

        for (let i = 0; i <= div; i++) {
            //Vertical line
            p = -half + (i * step);
            verts.push(p);		//x1
            verts.push(half);	//y1
            verts.push(0);		//z1
            verts.push(0);		//c2

            verts.push(p);		//x2
            verts.push(-half);	//y2
            verts.push(0);		//z2
            verts.push(1);		//c2

            //Horizontal line
            p = half - (i * step);
            verts.push(-half);	//x1
            verts.push(p);		//y1
            verts.push(0);		//z1
            verts.push(0);		//c1

            verts.push(half);	//x2
            verts.push(p);		//y2
            verts.push(0);		//z2
            verts.push(1);		//c2
        }

        if (incAxis) {
            //x axis
            verts.push(-1.1);	//x1
            verts.push(0);		//y1
            verts.push(0);		//z1
            verts.push(1);		//c2

            verts.push(1.1);	//x2
            verts.push(0);		//y2
            verts.push(0);		//z2
            verts.push(1);		//c2

            //y axis
            verts.push(0);//x1
            verts.push(-1.1);	//y1
            verts.push(0);		//z1
            verts.push(2);		//c2

            verts.push(0);		//x2
            verts.push(1.1);	//y2
            verts.push(0);		//z2
            verts.push(2);		//c2

            //z axis
            verts.push(0);		//x1
            verts.push(0);		//y1
            verts.push(-1.1);	//z1
            verts.push(3);		//c2

            verts.push(0);		//x2
            verts.push(0);		//y2
            verts.push(1.1);	//z2
            verts.push(3);		//c2
        }

        // let mesh = gl.fCreateMeshVAO("grid", null, verts, null, null);
        // mesh.drawMode = gl.LINES;

        let attrColorLoc = 5,
            strideLen,
            mesh = {
                drawMode: gl.LINES,
                vao: gl.createVertexArray()
            };

        mesh.vertexComponentLen = 4;
        mesh.vertexCount = verts.length / mesh.vertexComponentLen;
        strideLen = Float32Array.BYTES_PER_ELEMENT * mesh.vertexComponentLen;

        mesh.bufVertices = gl.createBuffer();
        gl.bindVertexArray(mesh.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.bufVertices);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(ATTR_POSITION_LOC);
        gl.enableVertexAttribArray(attrColorLoc);

        gl.vertexAttribPointer(
            ATTR_POSITION_LOC  // Attribute Location
            , 3                // 在这个数据卷中，我们用到了几个元素
            , gl.FLOAT         // 元素的数据类型是什么
            , false            // 需要正规化吗？
            , strideLen        // 一个数据卷占几个Byte? 4*4
            , 0                // 从Buffer第几个字节开始读
        );

        gl.vertexAttribPointer(
            attrColorLoc
            , 1
            , gl.FLOAT
            , false
            , strideLen
            , Float32Array.BYTES_PER_ELEMENT * 3
        );

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.mMeshCache["grid"] = mesh;
        return mesh;
    }

};

Primitive.Quadrel = class {

    static createModel(gl) {
        return new Model(Primitive.Quadrel.createMesh(gl));
    }

    static createMesh(gl) {
        let aVert = [-0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0],
            aUV = [0, 0, 0, 1, 1, 1, 1, 0],
            aIndex = [0, 1, 2, 2, 3, 0];

        let mesh = gl.fCreateMeshVAO("Quadrel", aIndex, aVert, null, aUV);
        mesh.noCulling = true;
        mesh.doBlending = true;

        return mesh;
    }
};


Primitive.Cube8 = class {
    static createModel(gl) {
        return new Model(Primitive.Cube8.createMesh(gl));
    }

    static createMesh(gl) {
        let aVert = [
                -0.5, 0.5, 0, 0, -0.5, -0.5, 0, 0, 0.5, -0.5, 0, 0, 0.5, 0.5, 0, 0,
                -0.5, 0.5, 1, 1, -0.5, -0.5, 1, 1, 0.5, -0.5, 1, 1, 0.5, 0.5, 1, 1,
            ], // x, y, z, color[w]
            aUV = [
                0, 0, 0, 1, 1, 1, 1, 0,
                0, 0, 0, 1, 1, 1, 1, 0
            ],
            aIndex = [
                0, 1, 2, 2, 3, 0,
                0, 1, 5, 5, 4, 0,
                4, 5, 6, 6, 7, 4,
                2, 3, 7, 7, 6, 2,
                1, 2, 6, 6, 5, 1,
                3, 0, 4, 4, 7, 3
            ];

        let mesh = gl.fCreateMeshVAO("Cube8", aIndex, aVert, null, aUV, 4);
        // mesh.drawMode = gl.LINES;
        mesh.noCulling = true;
        mesh.doBlending = true;

        return mesh;
    }

};


Primitive.Cube24 = class {
    static createModel(gl, name) {
        return new Model(Primitive.Cube24.createMesh(gl, name, 1, 1, 1, 0, 0, 0));
    }

    static createMesh(gl, name, width, height, depth, x, y, z) {
        let w = width * 0.5, h = height * 0.5, d = depth * 0.5;
        let x0 = x - w, x1 = x + w, y0 = y - h, y1 = y + h, z0 = z - d, z1 = z + d;

        //Starting bottom left corner, then working counter clockwise to create the front face.
        //Backface is the first face but in reverse (3,2,1,0)
        //keep each quad face built the same way to make index and uv easier to assign
        let aVert = [
            x0, y1, z1, 0,	//0 Front
            x0, y0, z1, 0,	//1
            x1, y0, z1, 0,	//2
            x1, y1, z1, 0,	//3 

            x1, y1, z0, 1,	//4 Back
            x1, y0, z0, 1,	//5
            x0, y0, z0, 1,	//6
            x0, y1, z0, 1,	//7 

            x0, y1, z0, 2,	//7 Left
            x0, y0, z0, 2,	//6
            x0, y0, z1, 2,	//1
            x0, y1, z1, 2,	//0

            x0, y0, z1, 3,	//1 Bottom
            x0, y0, z0, 3,	//6
            x1, y0, z0, 3,	//5
            x1, y0, z1, 3,	//2

            x1, y1, z1, 4,	//3 Right
            x1, y0, z1, 4,	//2 
            x1, y0, z0, 4,	//5
            x1, y1, z0, 4,	//4

            x0, y1, z0, 5,	//7 Top
            x0, y1, z1, 5,	//0
            x1, y1, z1, 5,	//3
            x1, y1, z0, 5	//4
        ];

        //Build the index of each quad [0,1,2, 2,3,0]
        let aIndex = [];
        for (let i = 0; i < aVert.length / 4; i += 2) aIndex.push(i, i + 1, (Math.floor(i / 4) * 4) + ((i + 2) % 4));

        //Build UV data for each vertex
        let aUV = [];
        for (let i = 0; i < 6; i++) aUV.push(0, 0, 0, 1, 1, 1, 1, 0);

        //Build Normal data for each vertex
        let aNorm = [
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,		//Front
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,		//Back
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,		//Left
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,		//Bottom
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,		//Right
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0		//Top
        ];

        let mesh = gl.fCreateMeshVAO(name, aIndex, aVert, aNorm, aUV, 4);
        mesh.noCulling = true;	//TODO Only setting this true to view animations better.
        return mesh;
    }
};