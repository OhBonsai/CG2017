/**
 * Created by bonsai on 3/19/17.
 */
const T = require('three');

class RayGeo extends T.BufferGeometry{

    constructor(length, width, numOf){
        super();
        this.init(length, width, numOf);
    }

    init(length, width, numOf) {
        let totalNum = numOf * 3;

        this.addAttribute('position', new T.BufferAttribute(new Float32Array(totalNum * 3), 3));
        this.addAttribute('normal',   new T.BufferAttribute(new Float32Array(totalNum * 3), 3));
        this.addAttribute('uv',       new T.BufferAttribute(new Float32Array(totalNum * 2), 2));

        let attrPosition = this.getAttribute('position');
        let attrNormal = this.getAttribute('normal');
        let attrUV = this.getAttribute('uv');

        let uvIndex = 0;
        let nIndex = 0;
        let pIndex = 0;

        let pTmp1 = new T.Vector3();
        let pTmp2 = new T.Vector3();
        for (let i = 0; i < numOf; i++) {

            let p1 = new T.Vector3(0, 0, 0);
            let p2 = new T.Vector3();
            let p3 = new T.Vector3();

            pTmp1 = new T.Vector3(Math.random() - .5, Math.random() - .5, Math.random() - .5);
            pTmp1.normalize();
            pTmp1.multiplyScalar(length);

            pTmp2.copy(pTmp1);
            pTmp2.add(new T.Vector3((Math.random() - .5) * width, (Math.random() - .5) * width, (Math.random() - .5) * width));

            p2.copy(pTmp2);

            //pTmp2.copy( pTmp1 );
            pTmp2.add(new T.Vector3((Math.random() - .5) * width, (Math.random() - .5) * width, (Math.random() - .5) * width));
            p3.copy(pTmp2);

            let uv1 = new T.Vector2(0, .5);
            let uv2 = new T.Vector2(1, 0);
            let uv3 = new T.Vector2(1, 1);

            let norm = new T.Vector3();

            pTmp1.copy(p2);
            pTmp2.copy(p2);
            pTmp1.sub(p1);
            pTmp2.sub(p3);
            pTmp1.normalize();
            pTmp2.normalize();
            
            norm.crossVectors(pTmp1, pTmp2);
            norm.normalize();

            attrPosition.setXYZ(pIndex++, p1.x, p1.y, p1.z);
            attrPosition.setXYZ(pIndex++, p2.x, p2.y, p2.z);
            attrPosition.setXYZ(pIndex++, p3.x, p3.y, p3.z);

            attrUV.setXY(uvIndex++, uv1.x, uv1.y);
            attrUV.setXY(uvIndex++, uv2.x, uv2.y);
            attrUV.setXY(uvIndex++, uv3.x, uv3.y);

            attrNormal.setXYZ(nIndex++, norm.x, norm.y, norm.z);
            attrNormal.setXYZ(nIndex++, norm.x, norm.y, norm.z);
            attrNormal.setXYZ(nIndex++, norm.x, norm.y, norm.z);
        }
    }
}

export {RayGeo}
