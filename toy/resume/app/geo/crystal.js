/**
 * Created by bonsai on 3/19/17.
 */
const T = require('three');


let toCart = function (r, t) {

    let x = r * Math.cos(t);
    let y = r * Math.sin(t);

    return [x, y];
};


class CrystalGeo extends T.BufferGeometry{

    constructor(h, w, numOf, extraHeight=0){
        super();
        this.init(h, w, numOf, extraHeight);
    }

    init(h, w, numOf, extraHeight){
        let totalNum = (numOf + 1) * 6 * 6;

        let aPos = new T.BufferAttribute(new Float32Array(totalNum * 3), 3);
        let aNorm = new T.BufferAttribute(new Float32Array(totalNum * 3), 3);
        let aUV = new T.BufferAttribute(new Float32Array(totalNum * 2), 2);
        let aID = new T.BufferAttribute(new Float32Array(totalNum * 1), 1);
        let aEdge = new T.BufferAttribute(new Float32Array(totalNum * 1), 1);

        this.addAttribute('position', aNorm);
        this.addAttribute('normal', aPos);
        this.addAttribute('uv', aUV);
        this.addAttribute('id', aID);
        this.addAttribute('edge', aEdge);

        let positions = this.getAttribute('position').array;
        let normals = this.getAttribute('normal').array;
        let uvs = this.getAttribute('uv').array;
        let ids = this.getAttribute('id').array;
        let edges = this.getAttribute('edge').array;

        let directionPower = [0, 0, 0, 0, 0, 0];

        function assignAttributes(index, a_p, a_uv, a_e, id) {
            let indexId = (index / 3) * 1;

            ids[indexId + 0] = id;
            ids[indexId + 1] = id;
            ids[indexId + 2] = id;

            edges[indexId + 0] = a_e[0];
            edges[indexId + 1] = a_e[0];
            edges[indexId + 2] = a_e[0];

            let indexUV = (index / 3) * 2;

            uvs[indexUV + 0] = a_uv[0].x;
            uvs[indexUV + 1] = a_uv[0].y;

            uvs[indexUV + 2] = a_uv[1].x;
            uvs[indexUV + 3] = a_uv[1].y;

            uvs[indexUV + 4] = a_uv[2].x;
            uvs[indexUV + 5] = a_uv[2].y;

            positions[index + 0] = a_p[0].x;
            positions[index + 1] = a_p[0].y;
            positions[index + 2] = a_p[0].z;

            positions[index + 3] = a_p[1].x;
            positions[index + 4] = a_p[1].y;
            positions[index + 5] = a_p[1].z;

            positions[index + 6] = a_p[2].x;
            positions[index + 7] = a_p[2].y;
            positions[index + 8] = a_p[2].z;

            a_p[1].sub(a_p[0]);
            a_p[2].sub(a_p[0]);

            a_p[0].crossVectors(a_p[1], a_p[2]);
            a_p[0].normalize();


            normals[index + 0] = a_p[0].x;
            normals[index + 1] = a_p[0].y;
            normals[index + 2] = a_p[0].z;

            normals[index + 3] = a_p[0].x;
            normals[index + 4] = a_p[0].y;
            normals[index + 5] = a_p[0].z;

            normals[index + 6] = a_p[0].x;
            normals[index + 7] = a_p[0].y;
            normals[index + 8] = a_p[0].z;
        }

        let baseArray = [];
        for (let i = 0; i < numOf + 1; i++) {

            let posXY = [];
            let newHeight = h;
            let sqr = 10;

            if (i == 0) {
                posXY[0] = 0;
                posXY[1] = 0;
            } else {
                let which = Math.floor(Math.random() * 6);
                directionPower[which]++;

                sqr = Math.sqrt(directionPower[which]);
                newHeight = (h * (Math.random() * .3 + .7)) / sqr;

                if (newHeight > (h * .9)) {
                    newHeight = h * .9;
                }

                posXY = toCart(w * sqr, (which / 6) * 2 * Math.PI);
                let posXyExtra = toCart(w / sqr, (i / 6) * 2 * Math.PI);

                posXY[0] += posXyExtra[0];
                posXY[1] += posXyExtra[2];
            }

            baseArray.push([posXY, -newHeight]);

            let index = i * 6 * 12 * 3;

            let p1 = new T.Vector3();
            let p2 = new T.Vector3();
            let p3 = new T.Vector3();
            let a_p = [p1, p2, p3];


            let uv1 = new T.Vector2();
            let uv2 = new T.Vector2();
            let uv3 = new T.Vector2();

            let a_uv = [uv1, uv2, uv3];
            let a_e = [0, 0, 0];

            for (let j = 0; j < 6; j++) {
                let id = i / (numOf + 1);
                let subPosXY1 = toCart(w / (2 * sqr), (j / 6) * 2 * Math.PI);
                let subPosXY2 = toCart(w / (2 * sqr), ((j + 1) / 6) * 2 * Math.PI);

                let fPosX1 = posXY[0] + subPosXY1[0];
                let fPosY1 = posXY[1] + subPosXY1[1];

                let fPosX2 = posXY[0] + subPosXY2[0];
                let fPosY2 = posXY[1] + subPosXY2[1];

                let finalIndex = index + j * 12 * 3;

                let h1 = 0;
                let h2 = -newHeight;


                let t = ((j + 0) / 6) * Math.PI * 10;
                let uvX1 = Math.abs(Math.cos(t));

                let t1 = ((j + 1) / 6) * Math.PI * 10;
                let uvX2 = Math.abs(Math.cos(t1));

                let t2 = ((j + .5) / 6) * Math.PI * 10;
                let uvXC = Math.abs(Math.cos(t2));

                // Bottom
                p1.set(fPosX1, fPosY1, h1 + extraHeight);
                p2.set(fPosX2, fPosY2, h1 + extraHeight);
                p3.set(posXY[0], posXY[1], h1 + extraHeight + extraHeight);
                uv1.set(uvX1, 0);
                uv2.set(uvX2, 0);
                uv3.set(uvXC, 0);
                a_e = [1, 1, 0];
                assignAttributes(finalIndex, a_p, a_uv, a_e, id);

                // Middle
                p1.set(fPosX1, fPosY1, h1 + extraHeight);
                p2.set(fPosX2, fPosY2, h2 + extraHeight);
                p3.set(fPosX2, fPosY2, h1 + extraHeight);
                uv1.set(uvX1, 0);
                uv2.set(uvX2, .9);
                uv3.set(uvX2, 0);
                a_e = [1, 1, 1];
                assignAttributes(finalIndex + 9, a_p, a_uv, a_e, id);


                p1.set(fPosX1, fPosY1, h2 + extraHeight);
                p2.set(fPosX2, fPosY2, h2 + extraHeight);
                p3.set(fPosX1, fPosY1, h1 + extraHeight);
                uv1.set(uvX1, .9);
                uv2.set(uvX2, .9);
                uv3.set(uvX1, 0);
                a_e = [1, 1, 1];
                assignAttributes(finalIndex + 18, a_p, a_uv, a_e, id);

                // Top
                p1.set(fPosX2, fPosY2, h2 + extraHeight);
                p2.set(fPosX1, fPosY1, h2 + extraHeight);
                p3.set(posXY[0], posXY[1], h2 - extraHeight + extraHeight);
                uv1.set(uvX2, .9);
                uv2.set(uvX1, .9);
                uv3.set(uvXC, 1);
                a_e = [1, 1, 0];
                assignAttributes(finalIndex + 27, a_p, a_uv, a_e, id);
            }
        }

    }

}

export {CrystalGeo};