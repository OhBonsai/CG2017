/**
 * Created by bonsai on 3/25/17.
 */
const T = require('three');
import {scene} from '../env';

let roundRect = function(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
};

class NamedSprite {
    
    constructor(text, params) {
        var params = params || {};

        let fontface = params.fontface || "Arial";
        let fontsize =  params.fontsize ||  40;
        let borderThickness = params.borderThickness || 2;
        let borderColor = params.borderColor || { r:0, g:0, b:0, a:0.5 };
        let backgroundColor =  params.backgroundColor || { r:255, g:255, b:255, a:1.0 };

        let canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        let context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;

        let metrics = context.measureText(text);
        let textWidth = metrics.width;

        context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
            + backgroundColor.b + "," + backgroundColor.a + ")";
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
            + borderColor.b + "," + borderColor.a + ")";

        context.lineWidth = borderThickness;
        roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);

        // text color
        context.fillStyle = "rgba(0, 0, 0, 1.0)";
        context.fillText(text, borderThickness, fontsize + borderThickness);

        // canvas contents will be used for a texture
        let texture = new T.Texture(canvas);
        texture.needsUpdate = true;

        let spriteMaterial = new T.SpriteMaterial(
            { map: texture} );

        let sprite = new T.Sprite( spriteMaterial );
        sprite.scale.set(200,100,1.0);
        this.sprite = sprite;
    }

    getSprite(){
        return this.sprite;
    }

    joinScene(){
        scene.add(this.sprite);
    }
        
}
    
export {NamedSprite}
