
const dbPromise = idb.openDB('recette', 1, {
    upgrade(db) {
        if(!db.objectStoreNames.contains('recipes')){
            db.createObjectStore('recipes',{
                keyPath: 'name'
            })
        }

        if(!db.objectStoreNames.contains('sync-recipe')){
            db.createObjectStore('sync-recipe',{
                keyPath: 'name'
            })
        }
    }
})

const db = {
    async getAll(objectStoreName){
        return (await dbPromise).getAll(objectStoreName);
    },
    async get(objectStoreName, key){
        return (await dbPromise).get(objectStoreName, key);
    },
    async add(objectStoreName, data){
        const tx = (await dbPromise).transaction(objectStoreName, 'readwrite');
        await tx.store.add(data)
        await tx.done;
    },
    async put(objectStoreName, data){
        const tx = (await dbPromise).transaction(objectStoreName, 'readwrite');
        tx.store.put(data);
        await tx.done;
    },
    async clear(objectStoreName){
        const tx = (await dbPromise).transaction(objectStoreName, 'readwrite');
        tx.store.clear();
        await tx.done;
    },

    async deletedByKey(objectStoreName, key){
        return (await dbPromise).delete(objectStoreName, key);
        // tx.store.delete(objectStoreName,key)
        // await tx.done;
    }
}

