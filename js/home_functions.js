//=========IndexedDB functions=======
//Get profile data
function get_profile_data() {
    let db;
    let dbReq = indexedDB.open('myDatabase', 1);
    dbReq.onsuccess = function(event) {
        db = event.target.result;
        //console.log(db);
        var transaction = db.transaction(["profile"], "readonly");
        transaction.oncomplete = function(event) {
            //console.log("transcation success");
        };
        transaction.onerror = function(event) {
            console.log("transaction failed", transaction.error);
        };
        var objectStore = transaction.objectStore("profile");
        var objectStoreRequest = objectStore.getAll();
        objectStoreRequest.onsuccess = function(event) {
            var result = objectStoreRequest.result;
            document.getElementById('user_name').textContent = "Welcome - " + result[0].name;
            document.getElementById('user_title').textContent = result[0].title;

            //console.log(objectStoreRequest.result);
        };
    };
}

function get_recent_tools(){
    let db;
    let dbReq = indexedDB.open('myDatabase', 1);
    dbReq.onsuccess = function (event) {
        db = event.target.result;
        var transaction = db.transaction(["tools"], "readonly");
        transaction.oncomplete = function(event) {
            //console.log("transcation success");
          };
        transaction.onerror = function(event) {
            console.log("transaction failed", transaction.error);
        };
        var objectStore = transaction.objectStore("tools");
        var objectStoreRequest = objectStore.getAll();
        objectStoreRequest.onsuccess = function(event) {
            var result = objectStoreRequest.result;
            var list = "";
            var photo = '';
            var i;
            let nowSeconds = Math.floor(Date.now()/1000);
            let toSeconds = "";
            //2 month cutoff unix seconds 2629743
            let cutOffSeconds = (nowSeconds - 2629743);
            for(i=0; i<result.length; i++){
                toSeconds = Math.floor(Date.parse(result[i].tool_date)/1000);
                if(toSeconds >= cutOffSeconds){
                    if(result[i].tool_photo != ""){
                        photo = result[i].tool_photo;
                    }else{
                        photo = "images/tool_placeholder.jpg";
                    }    
                        list += "<div class=''><a href='/tools_edit.html?"+result[i].key+"'><img class='' src='"+photo+"'></a></div>";            
                    }
                    document.getElementById('recent_tools').innerHTML = list;
                }
            };
        };
    }

//======================
const show_reports = async() =>{
    let db_reports = new Dexie('myReports');
    db_reports.version(1).stores({
        reports: '++id, title, file, timestamp'
    });
    db_reports.open().then(function (db) {
       
    }).catch (function (err) {
        console.log("Database error: "+err)
    });
    const all = await db_reports.reports.toArray();
    if(all.length > 0){
        let nowSeconds = Math.floor(Date.now()/1000);
        let toSeconds = "";
        //2 month cutoff unix seconds 2629743
        let cutOffSeconds = (nowSeconds - 2629743);
        document.getElementById("reports").innerHTML = "";
        let i;
        for(i=0; i<all.length; i++){
            toSeconds = Math.floor(all[i].timestamp/1000);
            if(toSeconds >= cutOffSeconds){
                let objectURL = URL.createObjectURL(all[i].file)
                let objectName = all[i].title;
                let l = document.createElement("li");
                let l_li = document.createElement("a");
                let l_li_text = document.createTextNode(objectName);
                l_li.appendChild(l_li_text);
                l_li.href = objectURL;
                l_li.setAttribute('download', objectName);
                l.setAttribute('class', "list-group-item");
                l.appendChild(l_li);
                document.getElementById("reports").appendChild(l);
           }
        }
    }else{
        document.getElementById("reports").innerHTML = "<span class='text-muted'>no reports available</span>";
    }
}
