/**
 * Created by Bonsai on 17-3-23.
 */
const T = require('three');
import {LineGeo} from '../geo/line';
import {vs_dash_line, fs_dash_line} from '../shaders/shader';
import {scene, time} from '../env';


class DashLine{

    constructor(path, params){
        let {diffuse, thickness, opacity, dashSmooth} = params;

        this.diffuse = diffuse || 0xffffff;
        this.thickness = thickness || 0.02;
        this.opacity = opacity || 1.0;
        this.dashSmooth = dashSmooth || 0.01;


        this.geo = this.createGeometry(path);
        this.uniforms = {
            thickness:    {type:'f', value: this.thickness},
            opacity:      {type:'f', value: this.opacity},
            diffuse:      {type:'c', value: new T.Color(this.diffuse)},
            dashSteps:    {type:'f', value: 12 },
            dashDistance: {type:'f', value: 0.2 },
            dashSmooth:   {type:'f', value: this.dashSmooth }
        };

        this.mat = new T.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vs_dash_line,
            fragmentShader: fs_dash_line,
            side: T.DoubleSide
        });

        this.mesh = new T.Mesh(this.geo, this.mat);
        this.mesh.scale.multiplyScalar(1.);
    }

    createGeometry(path){
        return new LineGeo(path, true, true);
    }

    joinScene(){
        scene.add(this.mesh);
    }

    getRoad(){
        return this.mesh;
    }

    setDiffuse(c){
        this.diffuse = c;
        this.uniforms.diffuse.value = new T.Color(this.diffuse);
    }

    setOpacity(v){
        this.opacity = v;
        this.uniforms.opacity.value = this.opacity;
    }

    setThickness(v){
        this.thickness = v;
        this.uniforms.thickness.value = this.thickness;
    }

    setdashSmooth(v){
        this.dashSmooth = v;
        this.uniforms.dashSmooth.value = this.dashSmooth;
    }

    update(){
        this.uniforms.dashDistance.value = (Math.sin(time.value) / 2 + 0.5) * 0.5;
        this.uniforms.dashSteps.value = (Math.sin(Math.cos(time.value )) / 2 + 0.5) * 24;
        this.mesh.updateMatrixWorld();
    }
}

export {DashLine};