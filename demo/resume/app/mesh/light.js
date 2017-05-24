/**
 * Created by bonsai on 3/19/17.
 */
const T = require('three');
import {RayGeo} from '../geo/ray';
import {CrystalGeo} from '../geo/crystal';
import {vs_ray, fs_ray, vs_gem, fs_gem} from '../shaders/shader';
import {scene, camera, time} from '../env';


class Light{

    constructor(rayLength=2, rayWidth=.3, numRays=30){

        this.randID = Math.random();
        this.uniforms = {
            dT:          {type:"f",  value: 0},
            time:        {type:"f",  value: 0},
            progress:    {type:"f",  value: 0},
            iModelMat:   {type:"m4", value: new T.Matrix4()},
            breakingVal: {type:"f",  value: 0},
            bwVal:       {type:"f",  value: 0}
        };

        this.rayUniforms = {
            dT:      {type: "f", value: 0},
            time:     {type: "f", value: 0},
            fillVal: {type: "f", value: 0},
            iModelMat: this.uniforms.iModelMat
        };

        this.geo = this.createGeometry();

        this.mat = new T.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vs_gem,
            fragmentShader: fs_gem
        });

        this.mesh = new T.Mesh(this.geo, this.mat);
        this.mesh.scale.multiplyScalar(1);
        this.mesh.rotation.x = this.randID*2*Math.PI;
        this.mesh.rotation.y = this.randID*2*Math.PI;
        this.mesh.rotation.z = this.randID*2*Math.PI;

        this.rayGeo = new RayGeo(rayLength, rayWidth, numRays);
        this.rayMat = new T.ShaderMaterial({
            uniforms: this.rayUniforms,
            vertexShader: vs_ray,
            fragmentShader: fs_ray,
            transparent: true,
            blending: T.AdditiveBlending,
            side: T.DoubleSide
        });
        this.rayMat.depthTest = false;
        this.ray = new T.Mesh(this.rayGeo, this.rayMat);
        this.mesh.add(this.ray);
    }


    createGeometry() {
        return new CrystalGeo(.3, 3, 1, .2);
    }

    joinScene(){
        scene.add(this.mesh);
    }

    setPosition(x, y, z){
        this.mesh.position.copy(new T.Vector3(x, y, z));
    }

    setBreakingVals(sb, eb){
        this.startBreak = sb;
        this.endBreak = eb;
    }

    setBWVals(sb, eb){
        this.startBW = sb;
        this.endBW = eb;
    }

    setBreakingShimmer(amount){
        this.breakingShimmer = amount;
    }

    setRayFill(srf, erf){
        this.startRayFill = srf;
        this.endRayFill = erf;
    }

    // from : https://github.com/gre/smoothstep
    // license: BSD
    static smoothStep(min, max, value){
        let x = Math.max(0, Math.min(1, (value-min)/(max-min)));
        return x*x*(3 - 2*x);
    }

    update() {
        this.mesh.rotation.x += .001 * (this.randID * .2 + .8);
        this.mesh.rotation.y += .0018 * (this.randID * .2 + .8);
        this.mesh.rotation.z += .0021 * (this.randID * .2 + .8);

        if (this.startBreak) {
            this.uniforms.breakingVal.value = Light.smoothStep(this.startBreak, this.endBreak, camera.position.y);
        }

        if (this.startBW) {
            this.uniforms.bwVal.value = Light.smoothStep(this.startBW, this.endBW, camera.position.y);
        }

        if (this.startRayFill) {
            this.rayUniforms.fillVal.value = Light.smoothStep(this.startRayFill, this.endRayFill, camera.position.y);
        }

        if (this.breakingShimmer) {
            this.uniforms.breakingVal.value = (Math.sin(time.value * 20000) + 1) * this.breakingShimmer * .5;
        }

        this.mesh.updateMatrixWorld();
        this.uniforms.iModelMat.value.getInverse(this.mesh.matrixWorld);
    }
}

export {Light};