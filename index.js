
function createRecipeCard(data){
    var container = document.getElementById('home');

    var cardContainer = document.createElement('div');
    cardContainer.className = 'card';

    var cardItemContainer = document.createElement('div');
    cardItemContainer.className = 'card-item';

    var imgContainer = document.createElement('div');
    imgContainer.className = 'image-container';
    imgContainer.style.backgroundImage = 'url(http://localhost:8091'+data.image +')';
    // imgContainer.append(img);

    var captionContainer = document.createElement('div');
    captionContainer.className = 'caption-container';

    var captionTextContainer = document.createElement('span');
    captionTextContainer.textContent = data.name;
    captionContainer.append(captionTextContainer);

    cardItemContainer.append(imgContainer)
    cardItemContainer.append(captionContainer);
    cardContainer.append(cardItemContainer);
    container.append(cardContainer);
}

function initHome(){
    if(navigator.onLine){
        var domain = window.location.protocol + '//' + window.location.hostname;
        fetch(domain+":8091/recipes")
        .then(function(response) {
            return response.json();
        })
        .then(function(res){
            let result = res;
            var root = document.getElementById('root');

            var container = document.createElement('div');
            container.id = "home";
            container.className = "home";
            root.append(container);

            result.forEach(data => {
                createRecipeCard(data);
            });
        }).catch(function(error){
            console.log(error);
        })
    }

    if('indexedDB' in window){
        if(!navigator.onLine){
            db.getAll('recipes').then(function(data){
                let result = data;
                result.forEach(res => {
                    createRecipeCard(res);
                });
            })
        }
    }
}
    


function route(to){
    if(to == "AddRecipe"){
        document.getElementById('root').innerHTML = loadAddRecipe();
        initAddRecipe();
    } else {
        destroyAddRecipe();
        document.getElementById('root').innerHTML = '';
        initHome();
    }
}

route("Home");