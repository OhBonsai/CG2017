/**
 * Created by Bonsai on 17-3-21.
 */
const T = require('three');
import {vs_text, fs_text} from '../shaders/shader';
import {scene} from '../env';



class TextParticles {

    constructor(string, font, params) {
        var params = params || {};
        let letterWidth = params.letterWidth || 2.;
        let lineLength = params.lineLength || 50;
        let vsShader = params.vsShader || vs_text;
        let fsShader = params.fsShader || fs_text;


        this.letterWidth = letterWidth;
        this.lineLength = lineLength;

        this.font = font;

        this.vertexShader = vsShader;
        this.fragmentShader = fsShader;
        this.texture = this.font.texture;

        this.lineHeight = this.letterWidth * 2.4;
        this.width = this.letterWidth * this.lineLength;
        this.textParticle = this.createTextParticles(string, params);
    }

    joinScene(){
        scene.add(this.textParticle);
    }

    hide(){
        this.textParticle.visible = false;
    }

    show(){
        this.textParticle.visible = true;
    }

    getParticle(){
        return this.textParticle;
    }

    createTextParticles(string, params) {
        let particles = this.createParticles(string);
        let lookup = this.createLookupTexture(particles);
        let geometry = this.createGeometry(particles, true);
        let material = this.createMaterial(lookup, params);
        let particleSystem = new T.Mesh(geometry, material);

        particleSystem.frustumCulled = false;
        this.lookupTexture = lookup;

        particleSystem.size = lookup.size;
        particleSystem.lookup = lookup;
        particleSystem.totalWidth = this.width;
        particleSystem.totalHeight = particles.numberOfLines * this.lineHeight;

        return particleSystem;
    }

    createLookupTexture(particles) {
        let size = Math.ceil(Math.sqrt(particles.length));
        let data = new Float32Array(size * size * 4);
        for (let i = 0; i < size * size; i++) {
            if (i < particles.length) {
                data[i * 4 + 0] = particles[i][1] * this.letterWidth;
                data[i * 4 + 1] = -particles[i][2] * this.lineHeight;

                data[i * 4 + 2] = 0;
                data[i * 4 + 3] = 0;
            }
        }

        let texture = new T.DataTexture(data, size, size, T.RGBAFormat, T.FloatType);

        texture.minFilter = T.NearestFilter;
        texture.magFilter = T.NearestFilter;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;
        texture.size = size;
        texture.flipY = false;

        return texture;
    }

    createMaterial(lookupParam, params){
        let tParams = params || {}

        let texture = params.texture || this.texture;
        let lookup = params.lookup || lookupParam;
        let color = params.color || 0xff00ff;
        let opacity = params.opacity || 1;

        let attributes = {
            id:        {type: 'f',  value: null},
            lookup:    {type: 'f',  value: null},
            textCoord: {type: 'v4', value: null}
        };

        let c = new T.Color(color);

        let uniforms = {
            color:    {type: "c", value: c},
            t_lookup: {type: "t", value: lookup},
            t_text:   {type: "t", value: texture},
            opacity:  {type: "f", value: opacity}
        };

        if(params.uniforms){
            for(let key in params.uniforms){
                uniforms[key] = params.uniforms[key]
            }
        }

        let blend = params.blending || T.AdditiveBlending;
        let depth = params.depthWrite || false;
        let trans = params.transparent || true;
        let side = params.side || T.DoubleSide;

        let material = new T.ShaderMaterial({
            // shouldn't put attributes in shaderMat when three.js version > r73
            // attributes: attributes,
            uniforms: uniforms,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            transparent: trans,
            depthWrite: depth,
            blending: blend,
            side: side
        });

        return material
    }

    setPosition(x, y, z){
        this.textParticle.position.copy(new T.Vector3(x, y, z))
    }
}

class EnglishTextParticles extends TextParticles{

    constructor(string, font, params){
        super(string, font, params);
    }

    createParticles(string) {
        let particles = [];
        let lineArray = string.split('\n');
        let pointer = {'x': 0, 'y': 0};

        for (let line of lineArray) {
            pointer.x = 0;
            pointer.y++;

            let wordArray = line.split(" ");
            for (let word of wordArray) {
                let letterArray = word.split("");
                let l = letterArray.length;

                // make sure word go over line width
                let newL = pointer.x + l;
                if (newL > this.lineLength) {
                    pointer.x = 0;
                    pointer.y++;
                }

                //push a new particle for each place
                for (let letter of letterArray) {
                    particles.push([letter, pointer.x, pointer.y]);
                    pointer.x++;
                }

                //add space after each word
                pointer.x++
            }
        }

        particles.numberOfLines = pointer.y;
        return particles
    }

    createGeometry(particles) {
        let geometry = new T.BufferGeometry();

        let positions = new Float32Array(particles.length * 3 * 2 * 3);
        let uvs = new Float32Array(particles.length * 3 * 2 * 2);
        let ids = new Float32Array(particles.length * 3 * 2 * 1);
        let textCoords = new Float32Array(particles.length * 3 * 2 * 4);
        let lookups = new Float32Array(particles.length * 3 * 2 * 2);

        let uvA = new T.BufferAttribute(uvs, 2);
        let idA = new T.BufferAttribute(ids, 1);
        let posA = new T.BufferAttribute(positions, 3);
        let coordA = new T.BufferAttribute(textCoords, 4);
        let lookupA = new T.BufferAttribute(lookups, 2);

        geometry.addAttribute('uv', uvA);
        geometry.addAttribute('id', idA);
        geometry.addAttribute('position', posA);
        geometry.addAttribute('textCoord', coordA);
        geometry.addAttribute('lookup', lookupA);

        let lookupWidth = Math.ceil(Math.sqrt(particles.length));

        for (let i = 0; i < particles.length; i++) {
            let index = i * 3 * 2;
            let tc = this.getTextCoordinates(particles[i][0]);
            let l = tc[4];
            let r = tc[4] + tc[2];
            let b = tc[5] - tc[3];
            let t = tc[5];

            //rectangle index
            ids[index + 0] = i;
            ids[index + 1] = i;
            ids[index + 2] = i;
            ids[index + 3] = i;
            ids[index + 4] = i;
            ids[index + 5] = i;

            //rectangle position
            positions[index * 3 + 0] = l * this.letterWidth * 10;
            positions[index * 3 + 1] = t * this.letterWidth * 10;
            positions[index * 3 + 2] = 0;

            positions[index * 3 + 3] = l * this.letterWidth * 10;
            positions[index * 3 + 4] = b * this.letterWidth * 10;
            positions[index * 3 + 5] = 0;

            positions[index * 3 + 6] = r * this.letterWidth * 10;
            positions[index * 3 + 7] = t * this.letterWidth * 10;
            positions[index * 3 + 8] = 0;

            positions[index * 3 + 9] = r * this.letterWidth * 10;
            positions[index * 3 + 10] = b * this.letterWidth * 10;
            positions[index * 3 + 11] = 0;

            positions[index * 3 + 12] = r * this.letterWidth * 10;
            positions[index * 3 + 13] = t * this.letterWidth * 10;
            positions[index * 3 + 14] = 0;

            positions[index * 3 + 15] = l * this.letterWidth * 10;
            positions[index * 3 + 16] = b * this.letterWidth * 10;
            positions[index * 3 + 17] = 0;

            //uv mapping
            uvs[index * 2 + 0] = 0;
            uvs[index * 2 + 1] = 1;

            uvs[index * 2 + 2] = 0;
            uvs[index * 2 + 3] = 0;

            uvs[index * 2 + 4] = 1;
            uvs[index * 2 + 5] = 1;

            uvs[index * 2 + 6] = 1;
            uvs[index * 2 + 7] = 0;

            uvs[index * 2 + 8] = 1;
            uvs[index * 2 + 9] = 1;

            uvs[index * 2 + 10] = 0;
            uvs[index * 2 + 11] = 0;

            //center of the particle
            let x = i % lookupWidth;
            let y = Math.floor(i / lookupWidth);

            x += .5;
            y += .5;

            lookups[index * 2 + 0] = x / lookupWidth;
            lookups[index * 2 + 1] = y / lookupWidth;

            lookups[index * 2 + 2] = x / lookupWidth;
            lookups[index * 2 + 3] = y / lookupWidth;

            lookups[index * 2 + 4] = x / lookupWidth;
            lookups[index * 2 + 5] = y / lookupWidth;

            lookups[index * 2 + 6] = x / lookupWidth;
            lookups[index * 2 + 7] = y / lookupWidth;

            lookups[index * 2 + 8] = x / lookupWidth;
            lookups[index * 2 + 9] = y / lookupWidth;

            lookups[index * 2 + 10] = x / lookupWidth;
            lookups[index * 2 + 11] = y / lookupWidth;


            // texture
            textCoords[index * 4 + 0] = tc[0];
            textCoords[index * 4 + 1] = tc[1];
            textCoords[index * 4 + 2] = tc[2];
            textCoords[index * 4 + 3] = tc[3];

            textCoords[index * 4 + 4] = tc[0];
            textCoords[index * 4 + 5] = tc[1];
            textCoords[index * 4 + 6] = tc[2];
            textCoords[index * 4 + 7] = tc[3];

            textCoords[index * 4 + 8] = tc[0];
            textCoords[index * 4 + 9] = tc[1];
            textCoords[index * 4 + 10] = tc[2];
            textCoords[index * 4 + 11] = tc[3];

            textCoords[index * 4 + 12] = tc[0];
            textCoords[index * 4 + 13] = tc[1];
            textCoords[index * 4 + 14] = tc[2];
            textCoords[index * 4 + 15] = tc[3];

            textCoords[index * 4 + 16] = tc[0];
            textCoords[index * 4 + 17] = tc[1];
            textCoords[index * 4 + 18] = tc[2];
            textCoords[index * 4 + 19] = tc[3];

            textCoords[index * 4 + 20] = tc[0];
            textCoords[index * 4 + 21] = tc[1];
            textCoords[index * 4 + 22] = tc[2];
            textCoords[index * 4 + 23] = tc[3];
        }
        return geometry;
    }

    getTextCoordinates(letter){
        let index;
        let charCode = letter.charCodeAt(0);
        let charString = "" + charCode;

        //some weird CHAR CODES
        if (charCode == 8216) charCode = 39;
        if (charCode == 8217) charCode = 39;
        if (charCode == 8212) charCode = 45;

        for (let l in this.font) {
            if (l == charCode) index = this.font[l];
        }

        if (!index) {
            console.warn('NO LETTER:' + letter);
            index = [0, 0];
        }

        let left = index[0] / 1024;
        let top = index[1] / 1024;

        let width = index[2] / 1024;
        let height = index[3] / 1024;

        let xOffset = index[4] / 1024;
        let yOffset = index[5] / 1024;

        return [left, top, width, height, xOffset, yOffset];
    }
}


class ChineseTextParticles extends TextParticles{

    constructor(string, font, params){
        super(string, font, params);
    }

    createParticles(string) {
        let particles = [];
        let lineArray = string.split('\n');
        let pointer = {'x': 0, 'y': 0};

        for (let line of lineArray) {
            pointer.x = 0;
            pointer.y++;

            let letterArray = line.split("");
            for (let letter of letterArray){
                if (letter != ' ') {
                    particles.push([letter, pointer.x, pointer.y]);
                }
                pointer.x++;

            }
        }

        particles.numberOfLines = pointer.y;
        return particles
    }

    createGeometry(particles) {
        let geometry = new T.BufferGeometry();

        let positions = new Float32Array(particles.length * 3 * 2 * 3);
        let uvs = new Float32Array(particles.length * 3 * 2 * 2);
        let ids = new Float32Array(particles.length * 3 * 2 * 1);
        let textCoords = new Float32Array(particles.length * 3 * 2 * 4);
        let lookups = new Float32Array(particles.length * 3 * 2 * 2);

        let uvA = new T.BufferAttribute(uvs, 2);
        let idA = new T.BufferAttribute(ids, 1);
        let posA = new T.BufferAttribute(positions, 3);
        let coordA = new T.BufferAttribute(textCoords, 4);
        let lookupA = new T.BufferAttribute(lookups, 2);

        geometry.addAttribute('uv', uvA);
        geometry.addAttribute('id', idA);
        geometry.addAttribute('position', posA);
        geometry.addAttribute('textCoord', coordA);
        geometry.addAttribute('lookup', lookupA);

        let lookupWidth = Math.ceil(Math.sqrt(particles.length));

        for (let i = 0; i < particles.length; i++) {
            let index = i * 3 * 2;
            let tc = this.getTextCoordinates(particles[i][0]);
            let l = 0;
            let r = tc[2];
            let b = - tc[3];
            let t = 0;

            //rectangle index
            ids[index + 0] = i;
            ids[index + 1] = i;
            ids[index + 2] = i;
            ids[index + 3] = i;
            ids[index + 4] = i;
            ids[index + 5] = i;

            //rectangle position
            positions[index * 3 + 0] = l * this.letterWidth * 10;
            positions[index * 3 + 1] = t * this.letterWidth * 10;
            positions[index * 3 + 2] = 0;

            positions[index * 3 + 3] = l * this.letterWidth * 10;
            positions[index * 3 + 4] = b * this.letterWidth * 10;
            positions[index * 3 + 5] = 0;

            positions[index * 3 + 6] = r * this.letterWidth * 10;
            positions[index * 3 + 7] = t * this.letterWidth * 10;
            positions[index * 3 + 8] = 0;

            positions[index * 3 + 9] = r * this.letterWidth * 10;
            positions[index * 3 + 10] = b * this.letterWidth * 10;
            positions[index * 3 + 11] = 0;

            positions[index * 3 + 12] = r * this.letterWidth * 10;
            positions[index * 3 + 13] = t * this.letterWidth * 10;
            positions[index * 3 + 14] = 0;

            positions[index * 3 + 15] = l * this.letterWidth * 10;
            positions[index * 3 + 16] = b * this.letterWidth * 10;
            positions[index * 3 + 17] = 0;

            //uv mapping
            uvs[index * 2 + 0] = 0;
            uvs[index * 2 + 1] = 1;

            uvs[index * 2 + 2] = 0;
            uvs[index * 2 + 3] = 0;

            uvs[index * 2 + 4] = 1;
            uvs[index * 2 + 5] = 1;

            uvs[index * 2 + 6] = 1;
            uvs[index * 2 + 7] = 0;

            uvs[index * 2 + 8] = 1;
            uvs[index * 2 + 9] = 1;

            uvs[index * 2 + 10] = 0;
            uvs[index * 2 + 11] = 0;

            //center of the particle
            let x = i % lookupWidth;
            let y = Math.floor(i / lookupWidth);

            x += .5;
            y += .5;

            lookups[index * 2 + 0] = x / lookupWidth;
            lookups[index * 2 + 1] = y / lookupWidth;

            lookups[index * 2 + 2] = x / lookupWidth;
            lookups[index * 2 + 3] = y / lookupWidth;

            lookups[index * 2 + 4] = x / lookupWidth;
            lookups[index * 2 + 5] = y / lookupWidth;

            lookups[index * 2 + 6] = x / lookupWidth;
            lookups[index * 2 + 7] = y / lookupWidth;

            lookups[index * 2 + 8] = x / lookupWidth;
            lookups[index * 2 + 9] = y / lookupWidth;

            lookups[index * 2 + 10] = x / lookupWidth;
            lookups[index * 2 + 11] = y / lookupWidth;


            // texture
            textCoords[index * 4 + 0] = tc[0];
            textCoords[index * 4 + 1] = tc[1];
            textCoords[index * 4 + 2] = tc[2];
            textCoords[index * 4 + 3] = tc[3];

            textCoords[index * 4 + 4] = tc[0];
            textCoords[index * 4 + 5] = tc[1];
            textCoords[index * 4 + 6] = tc[2];
            textCoords[index * 4 + 7] = tc[3];

            textCoords[index * 4 + 8] = tc[0];
            textCoords[index * 4 + 9] = tc[1];
            textCoords[index * 4 + 10] = tc[2];
            textCoords[index * 4 + 11] = tc[3];

            textCoords[index * 4 + 12] = tc[0];
            textCoords[index * 4 + 13] = tc[1];
            textCoords[index * 4 + 14] = tc[2];
            textCoords[index * 4 + 15] = tc[3];

            textCoords[index * 4 + 16] = tc[0];
            textCoords[index * 4 + 17] = tc[1];
            textCoords[index * 4 + 18] = tc[2];
            textCoords[index * 4 + 19] = tc[3];

            textCoords[index * 4 + 20] = tc[0];
            textCoords[index * 4 + 21] = tc[1];
            textCoords[index * 4 + 22] = tc[2];
            textCoords[index * 4 + 23] = tc[3];
        }
        return geometry;
    }

    getTextCoordinates(letter){
        let index = this.font[letter];

        let left = index[0];
        let top = index[1];

        let width = index[2];
        let height = index[3];

        let xOffset = 0;
        let yOffset = 0;

        return [left, top, width, height, xOffset, yOffset];
    }
}

export {EnglishTextParticles, ChineseTextParticles}