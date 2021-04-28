//=========IndexedDB functions=======
//Get profile data
function get_profile_data(){
let db;
let dbReq = indexedDB.open('myDatabase', 1);
dbReq.onsuccess = function (event) {
    db = event.target.result;
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
        var seconds = objectStoreRequest.result[0].timestamp;
        var d = new Date(seconds);
        var d_date = d.getDate();
        var month = new Array();
        month[0] = "Jan";
        month[1] = "Feb";
        month[2] = "Mar";
        month[3] = "Apr";
        month[4] = "May";
        month[5] = "Jun";
        month[6] = "Jul";
        month[7] = "Aug";
        month[8] = "Sep";
        month[9] = "Oct";
        month[10] = "Nov";
        month[11] = "Dec";
        var d_month = month[d.getMonth()]; 
        
        var d_year = d.getFullYear();
        document.getElementById('user_name').value = result[0].name;
        document.getElementById('user_title').value = result[0].title;
        document.getElementById('user_dob').value = result[0].dob;
        document.getElementById('user_email').value = result[0].email;
        document.getElementById('user_phone').value = result[0].phone;
        document.getElementById('user_city').value = result[0].city;
        document.getElementById('user_province').value = result[0].province;
        document.getElementById('user_country').value = result[0].country;
        document.getElementById('timestamp').innerHTML = "Last saved: "+d_month+" "+d_date+", "+d_year;
        //console.log(curr_date, curr_month, curr_year);
        };
    };
}

function update_profile_data(){
    //show loader2
    document.getElementById('loader2').style.display = "inline-block";
    let user_city = document.getElementById('user_city').value;
    let user_country = document.getElementById('user_country').value;
    let user_dob = document.getElementById('user_dob').value;
    let user_email = document.getElementById('user_email').value;
    let user_name = document.getElementById('user_name').value;
    let user_phone = document.getElementById('user_phone').value;
    let user_province = document.getElementById('user_province').value;
    let user_title = document.getElementById('user_title').value;
    let db;
    let dbReq = indexedDB.open('myDatabase', 1);
    dbReq.onsuccess = function (event) {
        db = event.target.result;
        let tx = db.transaction(['profile'], 'readwrite');
        let store = tx.objectStore('profile');
        var timestamp_new = Date.now();
        // Put the data into the object store
        let note = {
            //avatar: data.avatar,
            city: user_city,
            country: user_country,
            dob: user_dob,
            email: user_email,
            name: user_name,
            phone: user_phone,
            province: user_province,
            title: user_title,
            timestamp: Date.now() 
        };
        store.put(note, 1);
        //Wait for the database transaction to complete
        tx.oncomplete = function () {
            
            update_profile_data_remote(user_name, user_email, user_dob, user_city, user_country, user_phone, user_province, user_title, timestamp_new);
        }
        tx.onerror = function (event) {
            alert('error storing note ' + event.target.errorCode);
        }
    };
}

function update_profile_data_remote(user_name, user_email, user_dob, user_city, user_country, user_phone, user_province, user_title, timestamp_new){
    var user = firebase.auth().currentUser;
    user.updateProfile({
    displayName: user_name
    //photoURL: "https://example.com/jane-q-user/profile.jpg"
    }).then(function(){}).catch(function(error){});
    //Update firestore
    if (user != null) {
        uid = user.uid;
        saveInfo(uid);
    }
    function saveInfo(uid){
        var saveinforef = dbh.collection("users").doc(uid);
        return saveinforef.update({
          name: user_name, 
          title: user_title,
          dob: user_dob, 
          city: user_city,
          phone: user_phone,
          province: user_province,
          country: user_country,
          timestamp: timestamp_new
            
        })
        .then(function() {
            document.getElementById('loader2').style.display = "none";
            document.getElementById('saved').style.display = "inline-block";
            console.log("Document successfully updated!");
        })
        .catch(function(error) {console.error("Error updating document: ", error);});
    };

   user.updateEmail(user_email).then(function() {
        
        }).catch(function(error) {
        // An error happened.
        if (user != null) {
            //email not updated, reset back to original
            var old_email = user.email;
           document.getElementById('user_email').value = user.email;

           let db;
           let dbReq = indexedDB.open('myDatabase', 1);
           dbReq.onsuccess = function (event) {
                db = event.target.result;
                let tx = db.transaction(['profile'], 'readwrite');
                let store = tx.objectStore('profile');
                // Put the data into the object store
                let note = {
                    city: user_city,
                    country: user_country,
                    dob: user_dob,
                    email: old_email,
                    name: user_name,
                    phone: user_phone,
                    province: user_province,
                    title: user_title,
                    timestamp: Date.now() 
                    };
                store.put(note, 1);
                //Wait for the database transaction to complete
                tx.oncomplete = function () {}
                tx.onerror = function (event) {alert('error storing note ' + event.target.errorCode);
                }
            };
        }
            alert(error.message);
        });   
        
}

function check_email_verified(){
    //Check if email is verified
    var user = firebase.auth().currentUser;
    var emailVerified;
    
    if (user != null) {
        emailVerified = user.emailVerified;
        console.log(emailVerified);
    }
    if (emailVerified === false){
        
        console.log("email not verifid, sending verification now:", emailVerified);
        /*user.sendEmailVerification().then(function() {
            // Email sent.
            console.log("Email sent");
          }).catch(function(error) {
            // An error happened.
          }); */
    }
}

function update_profile_password(){
    document.getElementById('pass_loader').style.display = "inline-block";
    var user = firebase.auth().currentUser;
    var newPass = document.getElementsByName('password')[0].value;
    var passwordConfirm = document.getElementsByName('password_confirm')[0].value;
    if (newPass != passwordConfirm) {
            alert("Passwords do not match.");
            document.getElementById('pass_loader').style.display = "none";
        } else {
            user.updatePassword(newPass).then(function() {
                document.getElementById('pass_loader').style.display = "none";
                document.getElementById('pass_saved').style.display = "inline-block";
                document.getElementById('user_password').value = "";
                document.getElementById('user_password_confirm').value = "";
                }).catch(function(error) {
                    // An error happened.
                    document.getElementById('pass_loader').style.display = "none";
                    alert(error.message);
                });
        }
    
    

}