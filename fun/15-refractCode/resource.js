/**
 * Created by bonsai on 29/01/18.
 */

class Resources{

    static setup(gl, completeHandler){
        Resources.gl = gl;
        Resources.onComplete = completeHandler;
        return this
    }

    static start(){
        if(Resources.Queue.length > 0) {
            Resources.loadNextItem()
        }
    }

    static loadTexture(name, src) {
        for(let i=0; i<arguments.length; i+=2){
            Resources.Queue.push({
                type: "img",
                name: arguments[i],
                src: arguments[i+1]
            })
        }
        return this
    }

    static loadNextItem(){
        if(Resources.Queue.length === 0){
            if(Resources.onComplete !== null) Resources.onComplete();
            else console.log("Resource Download Queue Complete");
            return;
        }

        let item = Resources.Queue.pop();
        switch (item.type){
            case "img":
                let img = new Image();
                img.queueData = item;
                img.onload = Resources.onDownloadSuccess;
                img.onabort = img.onerror = Resources.onDownloadError;
                img.src = item.src;
                break;
        }
    }

    static onDownloadSuccess(){
        if (this instanceof Image){
            let dat = this.queueData;
            Resources.gl.fLoadTexture(dat.name, this);
        }
    }

    static onDownloadError(){
        console.log("ERROR GETTING", this);
        Resources.loadNextItem();
    }
}

Resources.Queue = [];
Resources.onComplete = null;
Resources.gl = null;

