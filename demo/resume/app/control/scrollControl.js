/**
 * Created by Bonsai on 17-3-21.
 */
class ScrollControl{

    constructor(camera, params){
        this.camera = camera;
        let {dampening, minPos, maxPos, multiplier} = params;
        this.dampening  = dampening  || .9;
        this.minPos     = minPos     || -5;
        this.maxPos     = maxPos     ||  0;
        this.multiplier = multiplier || .01;

        this.speed = 0;
        this.active = true;

        let mouseWheelEvt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
        window.addEventListener(mouseWheelEvt, this.onMouseWheel.bind(this), false);

        //mobile
        this.startY = 0;
        this.endY = 0;
        window.addEventListener('touchstart', this.onTouchStart.bind(this), false );
        window.addEventListener('touchmove', this.onTouchMove.bind(this), false );

    }

    onMouseWheel(e){
        e.preventDefault();
        e.stopPropagation();

        let speed_delta;
        if((/Firefox/i.test(navigator.userAgent))){
            speed_delta = e.detail * -20;
        }else{
            speed_delta = e.wheelDeltaY;
        }
        this.speed += speed_delta * this.multiplier;
    }

    onTouchMove(e) {
        e.preventDefault();
        e.stopPropagation();

        // one finger slip the screen, ban multi finger
        if (e.touches.length == 1) {
            let touchPoints = e.touches[0];
            this.endY = touchPoints.pageY;
            this.speed += (this.endY - this.startY) * this.multiplier;
            this.startY = this.endY
        }
    }

    onTouchStart(e) {
        // disable some handler inner mobile browser 
        e.preventDefault();
        e.stopPropagation();

        // one finger slip the screen, ban multi finger
        if (e.touches.length == 1) {
            let touchPoints = e.touches[0];
            this.startY = touchPoints.pageY;
        }
    }

    update(){
        if(this.active){
            this.camera.position.y += this.speed;
            if(this.camera.position.y < this.minPos){
                let diff = this.minPos - this.camera.position.y;
                this.camera.position.y += diff * .1;
                this.speed = 0;
            }else if(this.camera.position.y > this.maxPos){
                let diff = this.maxPos - this.camera.position.y;
                this.camera.position.y += diff * .1;
                this.speed = 0;
            }
            this.speed *= this.dampening;
        }else{
            this.speed = 0;
        }
    }

    dispose(){
        this.speed = 0;
        this.active = false;
        // It's not useful, Bind return a new function- -!. dirty JS
        // let mouseWheelEvt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
        // window.removeEventListener(mouseWheelEvt, this.onMouseWheel.bind(this), false);
        // window.removeEventListener('touchstart', this.onTouchStart.bind(this), false );
        // window.removeEventListener('touchend', this.onTouchEnd.bind(this), false );
        // window.removeEventListener('touchmove', this.onTouchMove.bind(this), false );
    }

}

export {ScrollControl}
