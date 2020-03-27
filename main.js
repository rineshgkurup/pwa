
if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js').then(function(swreg){
        console.log("Service Worker registered!");
    }).catch(function(error){
        console.log("error", error);
    })
}