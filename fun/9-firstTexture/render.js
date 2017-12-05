/**
 * Created by bonsai on 27/10/17.
 */
class RenderLoop{
    constructor(callback){
        this.msLastFrame = null;
        this.msCurrent = null;
        this.callback = callback;
        this.isActive = false;
        this.fps = 0;

        let that = this;
        this.run = function(){
            that.msCurrent = performance.now();
            let dt = (that.msCurrent - that.msLastFrame)/1000.0;

            that.fps = Math.floor(1/dt);
            that.msLastFrame = that.msCurrent;
            that.callback(dt);
            if(that.isActive){
                window.requestAnimationFrame(that.run)
            }
        }
    }

    start(){
        this.isActive = true;
        this.msLastFrame = performance.now();
        window.requestAnimationFrame(this.run);
        return this;
    }

    stop(){
        this.isActive = false;
    }


}