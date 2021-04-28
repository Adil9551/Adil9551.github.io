function get_tools_data(){
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
            var list = "<tr class=\"header\"><th style=\"width:40%;\">Name</th><th style=\"width:30%;\">Store</th><th style=\"width:10%;\">Price</th><th style=\"width:20%;\">Date</th></tr>";
            var photo = '';
            var i;
            for(i=0; i<result.length; i++){
                if(result[i].tool_photo != ""){
                    photo = result[i].tool_photo;
                }else{
                    photo = "images/tool_placeholder.jpg";
                }    
                list = list +"<tr><td>"
                    +"<a href='/tools_edit.html?"+result[i].key+"'><img src='"+photo+"' alt='"+result[i].tool_name+"' width='80' height='80'></a>"+
                    "<p>"+result[i].tool_name+"</p>"+
                    "</td><td>"
                    +result[i].tool_store+
                    "</td><td>"
                    +result[i].tool_price+
                    "</td><td>"
                    +result[i].tool_date+
                    "</td></tr>";
                }
                document.getElementById('myTable').innerHTML = list;
            };
        };
    }

//======================