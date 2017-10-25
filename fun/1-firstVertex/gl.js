function glInstance(el){
    let gl = document.getElementById(el).getContext("webgl2");

    if(!gl){alert("can't create webgl2 context")}

    gl.clearColor(1., 1., 1., 1.);

    gl.fClear = function(){
        this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT);
        return this
    };

    gl.fSetSize = function(w, h){
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = w + 'px';
        this.canvas.width = w;
        this.canvas.height = h;

        this.viewport(0, 0, w, h);
        return this
    };
    return gl
}
