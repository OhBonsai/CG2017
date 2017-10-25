/**
 * Created by Bonsai on 17-3-23.
 */
const T = require('three');
import {LineGeo} from '../geo/line';
import {vs_line, fs_line} from '../shaders/shader';
import {scene, camera, time} from '../env';


class Road{

    constructor(path, params){
        var params = params || {};

        // for tile
        this.height = params.height || 0;

        this.diffuse = params.diffuse || 0xffffff;
        this.thickness = params.thickness || 2.;
        this.opacity = params.opacity || 1.0;


        this.geo = this.createGeometry(path);
        this.uniforms = {
            thickness: {type:"f", value: this.thickness},
            opacity:   {type:"f", value: this.opacity},
            diffuse:   {type:"c", value: new T.Color(this.diffuse)}
        };

        this.mat = new T.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vs_line,
            fragmentShader: fs_line,
            side: T.DoubleSide
        });

        this.mesh = new T.Mesh(this.geo, this.mat);
        this.mesh.scale.multiplyScalar(1.);
    }

    createGeometry(path){
        return new LineGeo(path, false, false, this.height);
    }

    joinScene(){
        scene.add(this.mesh);
    }

    getRoad(){
        return this.mesh;
    }

    setDiffuse(c){
        this.diffuse = c;
    }

    setOpacity(v){
        this.opacity = v;
    }

    setThickness(v){
        this.thickness = v;
    }

    update(){
        if(this.opacity) this.uniforms.opacity.value = this.opacity;
        if(this.diffuse) this.uniforms.diffuse.value = this.diffuse;
        if(this.thickness)　this.uniforms.thickness.value = this.thickness;
        this.mesh.updateMatrixWorld();
    }
}

export {Road};