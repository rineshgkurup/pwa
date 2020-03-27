function submitRecipe(){
    var recipeName = document.getElementById('name').value;
    var recipeImage = document.getElementById('image').value;
    var data = {
        'name': recipeName,
        'image': recipeImage
    }
    

    if('serviceWorker' in navigator && 'SyncManager' in window){
        navigator.serviceWorker.ready.then(function(sw){
            db.add('sync-recipe', data).then(function(){
                return sw.sync.register('sw-sync-recipe');
            }).then(function(){
                console.log("sync registered");
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
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).then(function(res){
        console.log(res);
    }).catch(function(error){
        console.log(error);
    })
}

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