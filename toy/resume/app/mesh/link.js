/**
 * Created by bonsai on 3/26/17.
 */
const T = require('three');
import {fs_title, vs_title} from '../shaders/shader';
import {EnglishTextParticles} from './textParticles';
import {scene, oControls} from '../env';


class Link{
    
    constructor(font, title, link){
        this.link = link;
        this.title = new EnglishTextParticles(title, font, {
            letterWidth: .03,
            lineLength: title.length,
            vsShader: vs_title,
            fsShader: fs_title
        }).getParticle();
        this.bg = new T.Mesh(
            new T.PlaneGeometry(1, 1),
            new T.MeshPhongMaterial({
                color:0x444444,
                emissive:0x222222,
                specular: 0xffffff,
                shininess:4
            })
        );
        this.bg.hoverOver = function(){
            // this point this.bg
            this.material.color.setHex(0x888888);
            this.material.emissive.setHex(0x888888);
        };
        this.bg.hoverOut  = function(){
            this.material.color.setHex(0x444444 );
            this.material.emissive.setHex(0x444444);
        };
        this.bg.select = function(){
            this.selected();
        }.bind(this);

        oControls.add(this.bg);

        this.bg.scale.x = this.title.totalWidth + .03;
        this.bg.scale.y = this.title.totalHeight + .03;
        this.bg.position.z = -.002;

        this.body = new T.Object3D();
    }

    setPosition(x, y, z){
        this.body.add(this.title);
        this.body.add(this.bg);
        this.title.position.x =  -this.title.totalWidth /2;
        this.title.position.y =   this.title.totalHeight/ 1.3;
        this.body.position.copy(new T.Vector3(x,y,z));
    }

    joinScene(){
        scene.add(this.body)
    }

    selected(){
        // window.open(this.link , "_blank");
        window.open(this.link, "_parent");
    }


}

export {Link}

