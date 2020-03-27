importScripts('./scripts/idb.js');
importScripts('./utility.js');

var STATIC_CACHE = 'Static-v2';
var DYNAMIC_CACHE = 'Dynamic-v1';
var staticFiles = [
    '/',
    '/index.html',
    '/app/add-recipe.html',
    '/app/faq.html',
    '/main.js',
    '/index.js',
    '/add-recipe.js',
    '/assets/css/main.css',
    '/assets/images/logo.png',
    '/favicon.ico',
    '/scripts/idb.js',
    '/utility.js'
];

function searchAsset(url){
    let found = false;
    staticFiles.filter(function(file){
        var rx = new RegExp(file+"$", 'i');
        if(url.match(rx)){
            found = true;
        }
    })
    return found;
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(staticFiles)
        }).then(function(){
            return self.skipWaiting();
        })
    )
})


self.addEventListener('activate', function(event){
    cacheKeepList = [STATIC_CACHE,DYNAMIC_CACHE];
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if(cacheKeepList.indexOf(key) === -1){
                    return caches.delete(key);
                }
            }))
        }).then(function(){
            return self.clients.claim();
        })
    )
})


self.addEventListener('fetch', (event) => {
    if(event.request.url === 'http://localhost:8091/recipes'){
        event.respondWith(
            fetch(event.request)
            .then(function(res){
                var clonedResponse = res.clone();
                db.clear('recipes').then(function(){
                    clonedResponse.json().then((data) => {
                        for(var key in data){
                            console.log(data[key]);
                            db.add("recipes", data[key])
                        }
                    })
                });
                return res;
            })
        );
    } else if(searchAsset(event.request.url)){
        event.respondWith(
            caches.open(STATIC_CACHE).then(function(cache){
                return cache.match(event.request);
            }));
    }else{
        event.respondWith(
            caches.open(DYNAMIC_CACHE).then(function(cache){
                return cache.match(event.request).then((response) => {
                    return response || fetch(event.request).then(function(response){
                        cache.put(event.request, response.clone());
                        return response;
                    });
                })
            })
        );
    }
  });

  function syncRecipe(){
    console.log('called syncRecipe');
    db.getAll('sync-recipe').then(function(idbData){
        for(var key in idbData){
            fetch("http://localhost:8091/recipes", {
                method:'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(idbData[key])
            }).then(function(res){
               return res.json();
            }).then(function(data){
                db.deletedByKey("sync-recipe", data.name)
                .then((dbres) => {
                    console.log("deleted", data.name);
                }).catch((error) => {
                    console.log("Error in delete", data.name);
                })
             }).catch(function(error){
                console.log('error');
            })
        }
    })
    
  }


  self.addEventListener("sync", function(event){
      console.log(event.tag);
      if(event.tag == 'sw-sync-recipe'){
          console.log('sw-sync-recipe');
          event.waitUntil(syncRecipe())
      }
  })


  self.addEventListener('push', function(event) {
    var data = event.data.json();
    const promiseChain = self.registration.showNotification(data.title, data);
  
    event.waitUntil(promiseChain);
  });

  function doSomething(){
    const urlToOpen = new URL('/app/faq.html', self.location.origin).href;

    const promiseChain = clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((windowClients) => {
      let matchingClient = null;
    
      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        if (windowClient.url === urlToOpen) {
          matchingClient = windowClient;
          break;
        }
      }
    
      if (matchingClient) {
        return matchingClient.focus();
      } else {
        return clients.openWindow(urlToOpen);
      }
    });

    return promiseChain;
  }

  self.addEventListener('notificationclick', function(event) {
    const clickedNotification = event.notification;
    clickedNotification.close();
  
    // Do something as the result of the notification click
    const promiseChain = doSomething();
    event.waitUntil(promiseChain);
  });