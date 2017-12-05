/**
 * Created by bonsai on 20/11/17.
 */
const Primitive = {};

Primitive.GridAxis = class {

    static createModel(gl, incAxis = true) {
        return new Model(Primitive.GridAxis.createMesh(gl, incAxis));
    }

    static createMesh(gl, incAxis = true) {
        let verts = [],
            size = 1.8,
            div = 10.0,
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
        gl.enableVertexAttribArray(ATTR_POSTION_LOC);
        gl.enableVertexAttribArray(attrColorLoc);

        gl.vertexAttribPointer(
            ATTR_POSTION_LOC  // Attribute Location
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
        let aVert = [ -0.5,0.5,0, -0.5,-0.5,0, 0.5,-0.5,0, 0.5,0.5,0 ],
            aUV = [ 0,0, 0,1, 1,1, 1,0 ],
            aIndex = [ 0,1,2, 2,3,0 ];

        let mesh = gl.fCreateMeshVAO("Quadrel", aIndex, aVert, null, aUV);
        mesh.noCulling = false;
        mesh.doBlending = false;

    }
};