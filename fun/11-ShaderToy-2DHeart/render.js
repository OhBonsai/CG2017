/**
 * Created by bonsai on 27/10/17.
 */

/*NOTES:
 Tutorial on how to control FPS :: http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/

 EXAMPLE:
 rloop = new RenderLoop(function(dt){
 console.log(rloop.fps + " " + dt);
 },10).start();
 */

class RenderLoop{
    constructor(callback){
        this.msLastFrame = null;
        this.msCurrent = null;
        this.callback = callback;
        this.isActive = false;
        this.fps = 0;

        let that = this;

        if(this.fps && this.fps>0){
            this.msFpsLimit = 1000/this.fps;
            this.run = function(){
                let msCurrent = performance.now(),
                    msDelta = (msCurrent - that.msLastFrame),
                    deltaTime = msDelta / 1000.;

                if(msDelta >= that.msFpsLimit){
                    that.fps = Math.floor(1/deltaTime);
                    that.msLastFrame = msCurrent;
                    that.callback(deltaTime)
                }

                if(that.isActive){
                    window.requestAnimationFrame(that.run)
                }
            }
        }else{
            this.run = function(){
                let msCurrent = performance.now();
                let deltaTime = (msCurrent - that.msLastFrame)/1000.0;

                that.fps = Math.floor(1/deltaTime);
                that.msLastFrame = msCurrent;
                that.callback(deltaTime);
                if(that.isActive){
                    window.requestAnimationFrame(that.run)
                }
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