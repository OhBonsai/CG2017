/**
 * Created by bonsai on 3/25/17.
 */
const T = require('three');
import {scene} from '../env';
import {getJSON} from '../gis/dataPromise';
import {Road} from './road';
import {NamedSprite} from './namedSprite';
import {PolygonGeo} from '../geo/polygon';

class Tile{

    constructor(url){
        this.url = url;
        this.init();
    }

    init(){
        this.tile = new T.Group();
        let _this = this;

        // create land
        this.land = new T.Mesh(
            // tile data in 4096 coordinate
            new T.PlaneGeometry(4096, 4096),
            new T.MeshPhongMaterial({color: 0x00ff00, specular: 0x111111, side: T.DoubleSide})
        );
        this.tile.add(this.land);

        // create road
        this.roadGroup = new T.Group();
        this.tile.add(this.roadGroup);
        getJSON(this.url + 'link.json').then(function(data){
            data.forEach(function(pointList){
                let shapePath = [];
                for(let i=0; i<pointList.length; i+=2){
                    shapePath.push([pointList[i], pointList[i+1]]);
                }
                _this.roadGroup.add(new Road(shapePath, {height: 2}).getRoad());
            });
        });
        this.roadGroup.translateX(-2048);
        this.roadGroup.translateY(-2048);

        // create name
        this.nameGroup = new T.Group();
        this.tile.add(this.nameGroup);
        getJSON(this.url + 'name.json').then(function(data){
            data.forEach(function(name){
                let nameSprite = new NamedSprite(name.name).getSprite();
                nameSprite.position.set(name.pos[0], name.pos[1], 5);
                _this.nameGroup.add(nameSprite);
            });
        });
        this.nameGroup.translateX(-2048);
        this.nameGroup.translateY(-2048);

        // create building
        this.buildingGroup = new T.Group();
        this.tile.add(this.buildingGroup);
        getJSON(this.url + 'build.json').then(function(data){
            data.forEach(function(buildData){
                let buildGeo = new PolygonGeo(buildData);
                let buildMesh = new T.Mesh(buildGeo, new T.MeshPhongMaterial({
                    color: 0xB0DCD5,
                    emissive: 0x072534,
                    side: T.DoubleSide,
                    shading: T.FlatShading
                }));
                _this.buildingGroup.add(buildMesh);
            });
        });
        this.buildingGroup.translateX(-2048);
        this.buildingGroup.translateY(-2048);

        // create light
        this.lightGroup = new T.Group();
        this.tile.add(this.lightGroup);
        let light0 = new T.PointLight(0xffffff, 1, 0);
        let light1 = new T.PointLight(0xffffff, 1, 0);
        let light2 = new T.PointLight(0xffffff, 1, 0);
        light0.position.set(0, 4000, 0);
        light1.position.set(2000, 4000, 2000);
        light2.position.set(-2000, -4000, -2000);
        this.lightGroup.add(light0);
        this.lightGroup.add(light1);
        this.lightGroup.add(light2);

        this.tile.scale.set(.001,.001,.001);
        this.tile.rotation.x = Math.PI * -.5;
        this.tile.rotation.z = Math.PI * -.05;
    }

    joinScene(){
        scene.add(this.tile);
    }

    update(){
        // this.tile.rotation.y = Math.PI * -.1;
    }

    setPostion(x, y, z){
        this.tile.position.copy(new T.Vector3(x, y, z))
    }
}

export {Tile}