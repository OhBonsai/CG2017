/**
 * Created by bonsai on 3/26/17.
 */
const T = require('three');
import {scene, time} from '../env';
import {fs_heart, vs_heart, fs_3d_heart} from '../shaders/shader';



class Heart{
    constructor(){
        this.init();
    }

    init(){
        let geo = new T.PlaneGeometry(1,1);

        this.uniforms = {
            time: {type: 'f', value: 0.}
        };

        let mat = new T.ShaderMaterial({
            uniforms: this.uniforms,
            // fragmentShader: fs_3d_heart,
            fragmentShader: fs_heart,
            vertexShader: vs_heart,
            side: T.DoubleSide
        });
        this.mesh = new T.Mesh(geo, mat);
        this.mesh.scale.set(.6/.8,.6/.8,.6/.8);
        // this.mesh.rotation.x = Math.PI * -.5;
    }

    joinScene(){
        scene.add(this.mesh);
    }

    setPosition(x, y, z){
        this.mesh.position.copy(new T.Vector3(x, y, z));
    }

    update(){
        this.uniforms.time.value = time.value;
    }
}

export {Heart};