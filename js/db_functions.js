function signUserOut() {
    firebase.auth().signOut().then(function() {
        //console.log('Signed Out');
        window.location = "/index.html";
    }, function(error) {
        console.error('Sign Out Error', error);
    });
};


//IndexedDB functions - local persistent data
//Check user browser support of IndexedDB, retrieve data, push from Firebase into indexdb
function check_if_indexeddb_supported(displayName, email, uid, data, tools) {
        if (!('indexedDB' in window)) {
            //Let user know to upgrade their browser
            console.log('This browser doesn\'t support IndexedDB');
            return;
        } else {
            //Clear all notes from Profile then re-create from Firestore
            //delete_indexeddb_note();
            //console.log(tools);
            let db;
            let dbReq = indexedDB.open('myDatabase', 1);
            dbReq.onupgradeneeded = function (event) {
            // Set the db variable to our database so we can use it!  
            db = event.target.result;
            // Create an object store named notes. Object stores
            // in databases are where data are stored.
            let notes = db.createObjectStore('profile', { autoIncrement: true });
            let notes_tools = db.createObjectStore('tools', { autoIncrement: true });
            //if (!notes.indexNames.contains('UID')) {
            notes.createIndex('UID', 'id');
            console.log("index created for notes");
            //      }
            //if (!notes_tools.indexNames.contains('TID')) {
            notes_tools.createIndex('TID', 'key');
            console.log("index created for tool notes");
            //      }
        }

        dbReq.onsuccess = function(event) {
            db = event.target.result;
            //Clear tools
            let tx_del = db.transaction(['tools'], 'readwrite');
            let store_del = tx_del.objectStore('tools');
            let clear_store = store_del.clear();
            clear_store.onsuccess = function(event) {
                    console.log("tool deleted")
                }
                // Check if there is data in profile
            var store = db.transaction(['profile']).objectStore('profile');
            var count = store.count();
            count.onsuccess = function() {
                if (count.result === 0) {
                    addStickyNote(db, uid, displayName, email, data);
                    console.log(count.result);
                } else {
                    //getAndDisplayNotes(db);
                    addStickyNote(db, uid, displayName, email, data);
                }
            }
            let tx = db.transaction(['tools'], 'readwrite');
            let storeToolRequest = tx.objectStore('tools');
            //add looping here!!!!!!!!!!!!!!!!<____________-!!!
            tools.forEach(function(tool) {
                storeToolRequest.put(tool);
                tx.oncomplete = function() {
                    console.log('stored tool note!')
                }
            });
        }

        function addStickyNote(db, uid, displayName, email, data) {
            // Start a database transaction and get the notes object store
            let tx = db.transaction(['profile'], 'readwrite');
            let store = tx.objectStore('profile');
            // Put the sticky note into the object store
            let note = {
                id: uid,
                avatar: data.avatar,
                city: data.city,
                country: data.country,
                dob: data.dob,
                email: email,
                name: displayName,
                phone: data.phone,
                province: data.province,
                title: data.title,
                timestamp: Date.now()
            };
            store.put(note, 1);
            // Wait for the database transaction to complete
            tx.oncomplete = function() {
                console.log('stored note!')
                redirectToHome();
            }
            tx.onerror = function(event) {
                alert('error storing note ' + event.target.errorCode);
            }
        }

        dbReq.onerror = function(event) {
            alert('error opening database ' + event.target.errorCode);
        }
    }

};
//=======================
function redirectToHome() {
    window.location = "/home.html";
};

//display data from indexdb
function getAndDisplayNotes(db) {
    let tx = db.transaction(['profile'], 'readonly');
    let store = tx.objectStore('profile');
    let req = store.openCursor();
    let allNotes = [];
    req.onsuccess = function(event) {
        // The result of req.onsuccess is an IDBCursor
        let cursor = event.target.result;
        if (cursor != null) {
            allNotes.push(cursor.value);
            cursor.continue();
        } else {
            //displayNotes(allNotes);
        }
    }
    req.onerror = function(event) {
        alert('error in cursor request ' + event.target.errorCode);
    }
}
//User information is displayed here, "notes" is array of 2 objects
//First object is UID and name, second object UID and email
function displayNotes(notes) {
    //console.log(notes[1]);
    document.getElementById('account-details-name').textContent = notes[0].text;
    document.getElementById('account-details-email').textContent = notes[1].text;
}
//=======================
//Delete data from indexdb    
function delete_indexeddb_note() {
    let db;
    let dbReq = indexedDB.open('myDatabase', 1);
    dbReq.onsuccess = function(event) {
        db = event.target.result;
        let tx = db.transaction(['profile'], 'readwrite');
        let store = tx.objectStore('profile');
        let clear_store = store.clear();
        clear_store.onsuccess = function(event) {
            console.log("notes deleted")
        }
    }
}

//======================