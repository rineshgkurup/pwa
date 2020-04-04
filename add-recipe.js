function submitRecipe(){
    var recipeName = document.getElementById('name').value;
    var recipeImage = document.getElementById('file').files[0];
    var canvas = document.getElementById('canvas');
    var recipeImage = dataURItoBlob(canvas.toDataURL('image/png'));

    var syncdata = {
        'name': recipeName,
        'image': recipeImage
    };

    var data = new FormData();
    data.append('name', recipeName);
    data.append('file', recipeImage, 'mypicture.png');

    if('serviceWorker' in navigator && 'SyncManager' in window){
        navigator.serviceWorker.ready.then(function(sw){
            db.add('sync-recipe', syncdata).then(function(){
                return sw.sync.register('sw-sync-recipe');
            }).then(function(){
                console.log("sync registered");
                route("Home");
            }).catch(function(error){
                console.log(error);
            })
        })
    }else{
        sendData(data);
    }
}


function sendData(data){
    var domain = window.location.protocol + '//' + window.location.hostname;
    fetch("http://localhost:8091/recipes", {
        method:'POST',
        // headers: {
        //     'Content-Type': 'application/json',
        // },
        body: data
    }).then(function(res){
        console.log(res);
        route("Home");
    }).catch(function(error){
        console.log(error);
    })
}

function initAddRecipe() {
    var form = document.getElementById('recipe-form');
    form.addEventListener("submit", function(evt) {
        if (form.checkValidity() === false) {
        evt.preventDefault();
        return false;
        } else {
        // To prevent data from being sent, we've prevented submission
        // here, but normally this code block would not exist.
        evt.preventDefault();
        submitRecipe();
        return false;
        }
    });
}

function destroyAddRecipe(){
    // var form = document.getElementById('recipe-form');
    // if(form){
    //     form.
    // }
    
}




function loadAddRecipe(){
    return `<h2>Add Your Recipe</h2>
    <article>“If more of us valued food and cheer and song above hoarded gold, it would be a merrier world."</article>
    <hr/>
    <form id="recipe-form">
        <div class="form-control">
            <input type="text" name="name" id="name" placeholder="Recipe Name" minlength="5" required>
        </div>

        <div class="form-control">
            <input type="file" name="file" id="file" placeholder="Recipe image" >
        </div>
        <button type="button" onclick="displayCamera()">Show Camera</button>
        <button type="button" onclick="takePicture()">Take Snapshot</button>
        <div id="snapshot">
          <video id="video"></video>
          <canvas id="canvas"></canvas>
        </div>
        <div class="form-control submit-button">
            <button type="submit">Add Recipe</button>
        </div>
    </form>`
}


function displayCamera(){
    var constraints = { audio: true, video: { width: 300, height: 200 } }; 

    navigator.mediaDevices.getUserMedia(constraints)
    .then(function(mediaStream) {
        var video = document.querySelector('video');
        video.srcObject = mediaStream;
        video.onloadedmetadata = function(e) {
            video.play();
        };
    })
    .catch(function(err) { console.log(err.name + ": " + err.message); }); 
}

function takePicture(){
    var snapshot = document.getElementById('snapshot');
    var canvas = document.getElementById('canvas');
    canvas.width = 300;
    canvas.height = 200;
    snapshot.append(canvas);
    var ctx = canvas.getContext('2d');
    ctx.drawImage(document.getElementById('video'), 0, 0,canvas.width, canvas.height);
    // var dataURI = canvas.toDataURL('image/jpeg');
}

function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var arrayBuffer = new ArrayBuffer(byteString.length);
    var _ia = new Uint8Array(arrayBuffer);
    for (var i = 0; i < byteString.length; i++) {
        _ia[i] = byteString.charCodeAt(i);
    }

    var dataView = new DataView(arrayBuffer);
    var blob = new Blob([dataView], { type: mimeString });
    return blob;
}