function get_tool_data() {
    const queryString = window.location.search;
    strip = queryString.replace(/\?/g, '');
    if (strip === "New") {
        document.querySelector('#pageTitle').innerHTML = 'Create New Tool';
        new_tool_data();
        return;
    }

    let db;
    let dbReq = indexedDB.open('myDatabase', 1);
    dbReq.onsuccess = function(event) {
        db = event.target.result;
        var transaction = db.transaction(['tools'], 'readonly');
        var objectStore = transaction.objectStore('tools');
        var myIndex = objectStore.index('TID');
        var getReq = myIndex.get(strip);
        getReq.onsuccess = function() {
            var photo = '';
            var alt = ''
            var tool = getReq.result;
            if (tool.tool_photo != "") {
                photo = tool.tool_photo;
                alt = tool.tool_photo;
            } else {
                photo = "images/tool_placeholder.jpg";
                alt = "none";
            }
            document.getElementById('tool_key').innerHTML = tool.key;
            document.getElementById('tool_name').value = tool.tool_name;
            document.getElementById('tool_desc').value = tool.tool_desc;
            document.getElementById('tool_store').value = tool.tool_store;
            document.getElementById('tool_date').value = tool.tool_date;
            document.getElementById('tool_price').value = tool.tool_price;
            document.getElementById('tool_lend').value = tool.tool_lend;
            document.getElementById('tool_photo').src = photo;
            document.getElementById('tool_photo').alt = alt;

            if (tool.tool_doc === "") {
                document.getElementById('tool_doc_link').style.display = "none";
            } else {
                document.getElementById('tool_doc_link').style.display = "inline";

            }
            //document.getElementById('tool_doc_link').innerHTML = "Document";
            document.getElementById('tool_doc_link').href = tool.tool_doc;
            document.querySelector('#pageTitle').innerHTML = 'Edit Tool';
            //console.log(getReq);
        }
    }
}

function new_tool_data() {
    //Show prefill button
    document.getElementById('prefill').style.display = "inline-block";
    //Change Save button function from update to add
    document.getElementById('submit_btn').setAttribute('onclick', 'add_tool_data()');
    //----Generate unique ID for Firebase
    // Alphanumeric characters
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let autoId = '';
    for (let i = 0; i < 20; i++) {
        autoId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('tool_key').innerHTML = autoId;
    /* document.getElementById('myFile').style.display = "none";
    document.getElementById('myFile_label').style.display = "none";
    document.getElementById('tool_photo').style.display = "none"; */
    document.getElementById('doc_div').style.display = "none";
    document.getElementById('photo_div').style.display = "none";

    var photo = "images/tool_placeholder.jpg";
    var alt = "none";
    document.getElementById('tool_photo').src = photo;
    document.getElementById('tool_photo').alt = alt;
}

function add_tool_data() {
    document.getElementById('loader2').style.display = "inline-block";
    let tool_key = document.getElementById('tool_key').innerHTML;
    let tool_name = document.getElementById('tool_name').value;
    let tool_desc = document.getElementById('tool_desc').value;
    let tool_store = document.getElementById('tool_store').value;
    let tool_date = document.getElementById('tool_date').value;
    let tool_price = document.getElementById('tool_price').value;
    let tool_lend = document.getElementById('tool_lend').value;
    let tool_photo = document.getElementById('tool_photo').src;
    let photo_alt = document.getElementById('tool_photo').alt;
    if (photo_alt === "none") {
        tool_photo = "";
    }
    let db;
    let dbReq = indexedDB.open('myDatabase', 1);
    dbReq.onsuccess = function(event) {
        var timestamp_new = Date.now();
        db = event.target.result;
        // Start a database transaction and get the notes object store
        let tx = db.transaction(['tools'], 'readwrite');
        let store = tx.objectStore('tools');
        // Put the sticky note into the object store
        let note = {
            key: tool_key,
            tool_name: tool_name,
            tool_desc: tool_desc,
            tool_store: tool_store,
            tool_date: tool_date,
            tool_price: tool_price,
            tool_lend: tool_lend,
            tool_photo: tool_photo,
            timestamp: timestamp_new,
            tool_photo_ref: '',
            tool_doc: ''
        };
        store.put(note);
        // Wait for the database transaction to complete
        tx.oncomplete = function() {
            console.log('stored note!')
        }
        tx.onerror = function(event) {
            alert('error storing note ' + event.target.errorCode);
        }
        add_tool_data_remote(tool_key, tool_name, tool_desc, tool_store, tool_date, tool_price, tool_lend, tool_photo, timestamp_new);

    }

}

function add_tool_data_remote(tool_key, tool_name, tool_desc, tool_store, tool_date, tool_price, tool_lend, tool_photo, timestamp_new) {
    var user = firebase.auth().currentUser;
    uid = user.uid;
    dbh.collection("users").doc(uid).collection("tools").doc(tool_key).set({
            timestamp: timestamp_new,
            tool_date: tool_date,
            tool_desc: tool_desc,
            tool_doc: '',
            tool_lend: tool_lend,
            tool_name: tool_name,
            tool_photo: tool_photo,
            tool_photo_ref: '',
            tool_price: tool_price,
            tool_store: tool_store
        })
        .then(() => {
            console.log("Document successfully written!");
            redirect_to(tool_key);
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });

}

function redirect_to(tool_key) {
    window.location = "/tools_edit.html?" + tool_key;
}

function update_tool_data() {
    document.getElementById('loader2').style.display = "inline-block";
    let toolDoc = document.getElementById('tool_doc_link').style.display;
    let tool_doc = '';
    let tool_key = document.getElementById('tool_key').innerHTML;
    let tool_name = document.getElementById('tool_name').value;
    let tool_desc = document.getElementById('tool_desc').value;
    let tool_store = document.getElementById('tool_store').value;
    let tool_date = document.getElementById('tool_date').value;
    let tool_price = document.getElementById('tool_price').value;
    let tool_lend = document.getElementById('tool_lend').value;
    let tool_photo = document.getElementById('tool_photo').src;

    if (toolDoc == "none") {
        tool_doc = "";
        //console.log(toolDoc)
    } else {
        tool_doc = document.getElementById('tool_doc_link').href;
        //console.log("yes")
    }

    let photo_alt = document.getElementById('tool_photo').alt;
    if (photo_alt === "none") {
        tool_photo = "";
    }
    let db;
    let dbReq = indexedDB.open('myDatabase', 1);
    dbReq.onsuccess = function(event) {
        db = event.target.result;
        var transaction = db.transaction(['tools'], 'readwrite');
        var objectStore = transaction.objectStore('tools');
        var myIndex = objectStore.index('TID');
        myIndex.openCursor(tool_key).onsuccess = function(event) {
            var cursor = event.target.result;
            var timestamp_new = Date.now();
            if (cursor) {
                const updateData = cursor.value;
                updateData.tool_name = tool_name;
                updateData.tool_desc = tool_desc;
                updateData.tool_store = tool_store;
                updateData.tool_date = tool_date;
                updateData.tool_price = tool_price;
                updateData.tool_lend = tool_lend;
                updateData.tool_photo = tool_photo;
                updateData.timestamp = timestamp_new;
                updateData.tool_doc = tool_doc;

                const request = cursor.update(updateData);
                request.onsuccess = function() {
                    console.log('tool updated');
                };
                update_tool_data_remote(tool_key, tool_name, tool_desc, tool_store, tool_date, tool_price, tool_lend, tool_photo, timestamp_new, tool_doc);
                //cursor.continue();
            } else {
                console.log('Entries all displayed.');
            }
        };
    }

}

function update_tool_data_remote(tool_key, tool_name, tool_desc, tool_store, tool_date, tool_price, tool_lend, tool_photo, timestamp_new, tool_doc) {
    var user = firebase.auth().currentUser;
    uid = user.uid;
    var saveinforef = dbh.collection("users").doc(uid).collection("tools").doc(tool_key);
    return saveinforef.update({
            timestamp: timestamp_new,
            tool_date: tool_date,
            tool_desc: tool_desc,
            tool_doc: tool_doc,
            tool_lend: tool_lend,
            tool_name: tool_name,
            tool_photo: tool_photo,
            //tool_photo_ref: tool_photo_ref,
            tool_price: tool_price,
            tool_store: tool_store

        })
        .then(function() {
            document.getElementById('loader2').style.display = "none";
            document.getElementById('saved').style.display = "inline-block";
            console.log("Document successfully updated!");
        })
        .catch(function(error) { console.error("Error updating document: ", error); });
}

function update_tool_photo() {
    var user = firebase.auth().currentUser;
    uid = user.uid;
    let tool_key = document.getElementById('tool_key').innerHTML;
    let myPromise = new Promise(function(resolve, reject) {
        // "Producing Code" (May take some time)
        const filePicker = document.querySelector("input[name=attachment]");
        //console.log(filePicker);
        if (!filePicker || !filePicker.files || filePicker.files.length <= 0) {
            reject("No file slected"); // when error
            return;
        } else {
            const myFile = filePicker.files[0];
            if (myFile.size > 5485760) {
                reject('Image is too big (max. 5 Mb)');
                return;
            } else {
                resolve(myFile);
            }
        }
    });
    // "Consuming Code" (Must wait for a fulfilled Promise)
    myPromise.then(
        async function(myFile) {
            var blobURL = window.URL.createObjectURL(myFile);
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function() {
                    resolve(xhr.response);
                };
                xhr.onerror = function(e) {
                    console.log(e);
                    reject(new TypeError('Network request failed'));
                };
                xhr.responseType = 'blob';
                xhr.open('GET', blobURL, true);
                xhr.send(null);
            });
            // We're done with the blob, close and release it
            //blob.close();
            const ref = dbs.ref('users/' + uid + '/tools/' + tool_key + '_photo');
            const snapshot = await ref.put(blob);
            const toolPhotoUrl = await snapshot.ref.getDownloadURL();
            //console.log(toolPhotoUrl);
            document.getElementById('tool_photo').src = toolPhotoUrl;
            document.getElementById('tool_photo').alt = toolPhotoUrl;
            update_tool_data();

        },
        function(error) { console.log(error) }
    );
}

function update_tool_doc() {
    document.getElementById('loader2').style.display = "inline-block";
    var user = firebase.auth().currentUser;
    uid = user.uid;
    let tool_key = document.getElementById('tool_key').innerHTML;
    let myPromise = new Promise(function(resolve, reject) {
        // "Producing Code" (May take some time)
        const filePicker = document.querySelector("input[name=attachment_doc]");
        //console.log(filePicker);
        if (!filePicker || !filePicker.files || filePicker.files.length <= 0) {
            reject("No file slected"); // when error
            return;
        } else {
            const myFile = filePicker.files[0];
            if (myFile.size > 5485760) {
                reject('Image is too big (max. 5 Mb)');
                return;
            } else {
                resolve(myFile);
            }
        }
    });
    // "Consuming Code" (Must wait for a fulfilled Promise)
    myPromise.then(
        async function(myFile) {
            var blobURL = window.URL.createObjectURL(myFile);
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function() {
                    resolve(xhr.response);
                };
                xhr.onerror = function(e) {
                    console.log(e);
                    reject(new TypeError('Network request failed'));
                };
                xhr.responseType = 'blob';
                xhr.open('GET', blobURL, true);
                xhr.send(null);
            });
            // We're done with the blob, close and release it
            //blob.close();
            const ref = dbs.ref('users/' + uid + '/docs/' + tool_key + '_doc');
            const snapshot = await ref.put(blob);
            const toolPhotoUrl = await snapshot.ref.getDownloadURL();
            //console.log(toolPhotoUrl);
            document.getElementById('tool_doc_link').href = toolPhotoUrl;
            //document.getElementById('tool_doc_link').innerHTML = "Document";
            document.getElementById('tool_doc_link').style.display = "inline";
            update_tool_data();
        },
        function(error) { console.log(error) }
    );
}

function delete_confirm() {
    var r = confirm("Are you sure? This cannot be undone.");
    if (r == true) {
        console.log("You pressed OK!");
        delete_tool();
    } else {
        console.log("You pressed Cancel!");
        return;
    }
}

function delete_tool() {
    var user = firebase.auth().currentUser;
    uid = user.uid;
    let tool_key = document.getElementById('tool_key').innerHTML;
    let db;
    let dbReq = indexedDB.open('myDatabase', 1);
    dbReq.onsuccess = function(event) {
        db = event.target.result;
        var transaction = db.transaction(["tools"], "readwrite");
        var objectStore = transaction.objectStore("tools");
        objectStore.openCursor().onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                if (cursor.value.key === tool_key) {
                    const request = cursor.delete();
                    request.onsuccess = function() {
                        //console.log('Deleted tool');
                        delete_remote_assets();
                        delete_remote_tool();
                    };
                }
                cursor.continue();
            }
        };
    }

    function delete_remote_assets() {
        toolPhoto = document.getElementById('tool_photo').alt;
        toolDoc = document.getElementById('tool_doc_link').style.display;

        if (toolPhoto != "none") {
            var deleteRef = dbs.ref('users/' + uid + '/tools/' + tool_key + '_photo');
            deleteRef.delete().then(function() {
                console.log('Tool Image deleted successfuly!');
            }).catch(function(error) {
                console.error('Error removing file: ', error);
            });
        } else { console.log("No tool image found") };

        if (toolDoc === "inline") {
            var deleteRefDoc = dbs.ref('users/' + uid + '/docs/' + tool_key + '_doc');
            deleteRefDoc.delete().then(function() {
                console.log('Doc deleted successfuly!');
            }).catch(function(error) {
                console.error('Error removing file: ', error);
            });
        } else { console.log("No tool doc found") };

    }

    function delete_remote_tool() {
        dbh.collection("users").doc(uid).collection("tools").doc(tool_key).delete().then(() => {
            console.log("Document successfully deleted!");
            redirect_to_tools();

        }).catch((error) => {
            console.error("Error removing document: ", error);
        })
    }

    function redirect_to_tools() {
        window.location = "/tools.html";
    }

}


//======================