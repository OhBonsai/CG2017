/**
 * Created by Bonsai on 17-3-24.
 */
const T = require('three');


class PolygonGeo extends T.BufferGeometry{

    constructor(buildingData){
        super();
        this.init(buildingData.pointList, buildingData.triList, buildingData.height)
    }

    init(pointList, triList, height){

        // close points
        pointList.push(pointList[0]);

        // up and bottom point
        let count = pointList.length * 2;

        this.addAttribute('position', new T.BufferAttribute(new Float32Array(count * 3), 3));
        this.addAttribute('uv',   new T.BufferAttribute(new Float32Array(count * 2), 2));
        // need add side flat index, The count of side flat is (pointlength-1)*2*3
        // we wouldn't add bottom flat. so triList.length * 3
        this.setIndex(new T.BufferAttribute(new Uint16Array(count * 3 - 6 + triList.length * 3), 3));
        
        let attrPosition = this.getAttribute('position');
        let attrUV = this.getAttribute('uv');
        let attrIndex = this.getIndex();

        attrIndex.count = count * 3 - 6 + triList.length * 3;

        var index = 0;
        var uvIndex = 0;
        var c = 0;
        var indexArray = attrIndex.array;

        // facade of building
        pointList.forEach(function(point, pIndex){
            var i = index;
            indexArray[c++] = i+0;
            indexArray[c++] = i+1;
            indexArray[c++] = i+2;
            indexArray[c++] = i+2;
            indexArray[c++] = i+1;
            indexArray[c++] = i+3;

            attrPosition.setXYZ(index++, point[0], point[1], height+0.0);
            attrPosition.setXYZ(index++, point[0], point[1], 2.0);

            attrUV.setXY(uvIndex++, pIndex%2+0.0, 0.0);
            attrUV.setXY(uvIndex++, pIndex%2+0.0, 1.0);
        });

        c -= 6;

        triList.forEach(function(tri){
            indexArray[c++] = tri[0]*2;
            indexArray[c++] = tri[1]*2;
            indexArray[c++] = tri[2]*2;
        });
    }
}


export {PolygonGeo}

