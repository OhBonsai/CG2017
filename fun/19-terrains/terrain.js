class Terrain {

    static createModel(gl, keepRawData) {
        return new Model(Terrain.createMesh(gl, 10, 10, 20, 20, keepRawData))
    }

    static createMesh(gl, w, h, rLen, cLen, keepRawData) {

        let rStart = w / -2,
            cStart = h / -2,
            vLen = rLen * cLen,
            iLen = (rLen - 1) * cLen,
            cInc = w / (cLen - 1),
            rInc = h / (rLen - 1),
            cRow = 0,
            cCol = 0,
            aVert = [],
            aUV = [],
            uvxInc = 1 / (cLen -1),
            unyInc = 1 / (rLen - 1),
            aIndex = [];


        noise.seed(1);
        let hx = 0,
            freq = 13,
            maxHeight = -3;

        for (let i = 0; i < vLen; i++) {
            cRow = Math.floor(i / cLen);
            cCol = i % cLen;
            hx = noise.perlin2((cRow+1)/freq, (cCol+1)/freq)*maxHeight;

            aVert.push(cStart + cCol * cInc, .2 + hx, rStart + cRow * rInc);
            aUV.push((cCol === cLen - 1) ? 1: cCol * uvxInc,
                (cRow === rLen - 1) ? 1: cRow * unyInc);

            if (i < iLen) {
                aIndex.push(cRow * cLen + cCol, (cRow + 1) * cLen + cCol);
                if (cCol === cLen - 1 && i < iLen - 1) {
                    aIndex.push((cRow + 1) * cLen + cCol, (cRow + 1) * cLen);
                }
            }
        }


        let x,y,p, pos,
            xMax = cLen - 1,
            yMax = rLen - 1,
            nX = 0,
            nY = 0,
            nZ = 0,
            nL = 0,
            hL, hR, hD, hU, aNorm = [];

        for(let i=0; i<vLen; i++){
            y = Math.floor(i / cLen);
            x = i % cLen;

            // Norm是Vec3 所以这里要乘以3. 其实更简单点 应该直接些i * 3
            pos = y * 3 * cLen + x * 3;

            if(x > 0){
                // 如果不是每行第一个， 取左边点的位置
                p = y * 3 * cLen + (x-1)*3;
                // 左边点的高度
                hL = aVert[p+1];
            }else{
                // 如果是第一个，就取自己的高度。注意高度是Y轴。
                hL = aVert[pos+1]
            }

            if(x < xMax){
                p = y*3*cLen + (x+1)*3;
                hR = aVert[p+1]
            }else{
                hR = aVert[pos+1]
            }

            if(y > 0){
                // 如果不是每纵第一个， 取上边点的位置
                p = (y-1) * 3 * cLen + x*3;
                hU = aVert[p+1];
            }else{
                hU = aVert[pos+1]
            }

            if(y < yMax){
                p = (y+1)*3*cLen + x*3;
                hD = aVert[p+1]
            }else{
                hD = aVert[pos+1]
            }

            nX = hL - hR;
            nY = 2.0;
            nZ = hD - hU;
            nL = Math.sqrt(nX*nX+nY*nY+nZ*nZ);
            aNorm.push(nX/nL, nY/nL, nZ/nL);
        }

        let mesh = gl.fCreateMeshVAO("Terrain", aIndex, aVert, aNorm, aUV, 3);
        mesh.drawMode = gl.TRIANGLE_STRIP;
        mesh.noCulling = true;

        if(keepRawData){
            mesh.aVert = aVert;
            mesh.aIndex= aIndex;
            mesh.aNorm = aNorm;
            mesh.aUV = aUV;
        }

        return mesh

    }
}