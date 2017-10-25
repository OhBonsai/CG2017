/**
 * Created by Bonsai on 17-3-23.
 */
const getNormals = require('polyline-normals');
const T = require('three');
const VERTICES_PER_POINT = 2;

class LineGeo extends T.BufferGeometry{

    constructor(path, isDistance=false, isClosed=false, height=0){
        super();
        this.isDistance = isDistance;
        this.isClosed = isClosed;
        this.height = height;
        this.init(path);
    }

    init(path){
        let normals = getNormals(path);

        if (this.isClosed) {
            path = path.slice();
            path.push(path[0]);
            normals.push(normals[0]);
        }

        let count = path.length * VERTICES_PER_POINT;

        this.addAttribute('position', new T.BufferAttribute(new Float32Array(count * 3), 3));
        this.addAttribute('lineNormal', new T.BufferAttribute(new Float32Array(count * 2), 2));
        this.addAttribute('lineMiter', new T.BufferAttribute(new Float32Array(count), 1));
        //It's better use setIndex when T version > r73
        this.setIndex(new T.BufferAttribute(new Uint16Array(count * 3 - 6), 3));
        if(this.isDistance) this.addAttribute('lineDistance', new T.BufferAttribute(new Float32Array(count), 1))

        let attrPosition = this.getAttribute('position');
        let attrNormal = this.getAttribute('lineNormal');
        let attrMiter = this.getAttribute('lineMiter');
        let attrIndex = this.getIndex();
        if(this.isDistance) var attrDistance = this.getAttribute('lineDistance');

        //need set Attr count when T version > r76
        attrIndex.count = count * 3 - 6;

        // cost too much, only if your effort rely on attr changing, or you should not open it
        // attrPosition.needsUpdate = true;
        // attrNormal.needsUpdate = true;
        // attrMiter.needsUpdate = true;
        // attrIndex.needsUpdate = true;
        // if(this.isDistance) attrDistance = true;

        let pIndex = 0;
        let iIndex = 0;
        let nIndex = 0;
        let mIndex = 0;
        let dIndex = 0;

        path.forEach(function(point, pointIndex, list){
            let t = pIndex;
            attrIndex.setXYZ(iIndex++, t+0, t+1, t+2);
            attrIndex.setXYZ(iIndex++, t+2, t+1, t+3);
            attrPosition.setXYZ(pIndex++, point[0], point[1], this.height);
            attrPosition.setXYZ(pIndex++, point[0], point[1], this.height);
            if (attrDistance) {
                let d = pointIndex / (list.length - 1);
                attrDistance.setX(dIndex++, d);
                attrDistance.setX(dIndex++, d);
            }
        }.bind(this));

        normals.forEach(function(n){
            let norm = n[0];
            let miter = n[1];
            attrNormal.setXY(nIndex++, norm[0], norm[1]);
            attrNormal.setXY(nIndex++, norm[0], norm[1]);
            attrMiter.setX(mIndex++, -miter);
            attrMiter.setX(mIndex++, miter);
        });
    }
}

export {LineGeo}