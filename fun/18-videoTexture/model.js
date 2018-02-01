class Model {
    constructor(meshData) {
        this.mesh = meshData;
        this.transform = new Transform();
    }


    // set scale(s){
    //     // this.transfrom.scale = s; //不要这么写，传引用的。
    //     // this.transfrom.scale = Vector3(s); // 也不要这么写， 浪费空间
    //     return this;
    // }
    //
    // set position(p){
    //     this.transfrom.postion = p;
    //     return this;
    // }
    //
    // set rotation(s){
    //     this.transfrom.scale = s;
    //     return this;
    // }

    setScale(x, y, z) {
        this.transform.scale.set(x, y, z);
        return this;
    }

    setPosition(x, y, z) {
        this.transform.position.set(x, y, z);
        return this;
    }

    setRotation(x, y, z) {
        this.transform.rotation.set(x, y, z);
        return this;
    }

    addScale(x, y, z) {
        this.transform.scale.x += x;
        this.transform.scale.y += y;
        this.transform.scale.y += y;
        return this;
    }

    addPosition(x, y, z) {
        this.transform.position.x += x;
        this.transform.position.y += y;
        this.transform.position.z += z;
        return this;
    }

    addRotation(x, y, z) {
        this.transform.rotation.x += x;
        this.transform.rotation.y += y;
        this.transform.rotation.z += z;
        return this;
    }

    preRender(){
        this.transform.updateMatrix();
        return this;
    }
}