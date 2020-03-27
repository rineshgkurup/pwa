function subscribeToUser(){
    if('serviceWorker' in navigator){
        navigator.serviceWorker.register('/sw.js')
        .then(function(registration) {
            const subscribeOptions = {
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(
                'BOYDaRJhRk9a-0NSRTgtPF1bDcKyniGcK-sNIaCg5pu5EQ-sMupYyvDhIgYp3bDEnkcb0BDBuSuKP-hGKr1s-58'
              )
            };
        
            return registration.pushManager.subscribe(subscribeOptions);
        })
        .then(function(pushSubscription) {
    
            fetch('http://localhost:8091/subscribe', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(pushSubscription)
              })
              .then(function(response) {
                if (!response.ok) {
                  throw new Error('Bad status code from server.');
                }
                return response.json();
              })
              .then(function(responseData) {
                if (!responseData.msg) {
                  throw new Error('Bad response from server.');
                }
              })
              
            console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
            return pushSubscription;
        })
        .catch(function(error){
            console.log("error", error);
        })
    }
}



function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}


function askPermission() {
    return new Promise(function(resolve, reject) {
      const permissionResult = Notification.requestPermission(function(result) {
        resolve(result);
      });
  
      if (permissionResult) {
        permissionResult.then(resolve, reject);
      }
    })
    .then(function(permissionResult) {
      if (permissionResult !== 'granted') {
        throw new Error('We weren\'t granted permission.');
      }
      subscribeToUser();
    });
  }