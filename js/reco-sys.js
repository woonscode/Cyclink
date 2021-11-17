userId = Cookies.get("userId")

function getRecommendations() {
    final_dataset = []
    current_friends = []
    age_exp = {}
    str = ``
    var user = firebase.database().ref('users/')
    user.once("value").then((snapshot) => {
        let all_users = snapshot.val()
        var userId = Cookies.get("userId")
        for (user in all_users) {
            if (user != userId) {
                experience = all_users[user].experience
                age = all_users[user].age
                photo = all_users[user].photo
                firstname = all_users[user].firstname
                lastname = all_users[user].lastname
                userid = user
                age_exp[user] = { experience, age, photo, firstname, lastname, userid }
            }

            if (user == userId) {
                current_user_age = all_users[userId].age
                current_user_exp = all_users[userId].experience
                current_user_friends_object = all_users[userId].friends
                // object 
                // loop through friends and get indiv key 
                for (key in current_user_friends_object) {
                    // get name from key
                    current_friend_name = current_user_friends_object[key]
                    current_friends.push(current_friend_name)
                }


            }


        }
        for (info in age_exp) {
            check_age = age_exp[info].age
            check_exp = age_exp[info].experience
            check_photo = age_exp[info].photo
            check_firstname = age_exp[info].firstname
            check_lastname = age_exp[info].lastname
            check_userid = age_exp[info].userid
            if (!(current_friends.includes(check_userid))) {
                if (Math.abs(check_age - current_user_age) <= 5 && Math.abs(check_exp - current_user_exp) <= 3) {
                    str += `
                    <div class="col my-2 mx-auto" style="width: 18rem; text-align:center; height: 100%;">
                        <div class="card cardStack"> 
                            <img src="${check_photo}" class="card-img-top rounded mt-3 mx-auto d-block"alt="..." style="width: 50px; height: 50px;">
                            <div class ="card-body">
                                <h5 class ="card-title">${check_firstname} ${check_lastname}</h5>
                            </div>
                        </div>
                    </div>
                    `
                }

            }

        }
        document.getElementById("reco-cards").innerHTML = str
    })
}


function sendRecoRequest(name, userid) {
    let alert = ""
    let request = {
        approver: userid,
        datatime: new Date().toString(),
        sender: Cookies.get('userId'),
        status: 'Pending'
    }
    var requests_ref = firebase.database().ref('requests/')
    requests_ref.once('value').then((snapshot) => {
        let request_exists = false
        let all_requests = snapshot.val()
        for (db_request in all_requests) {
            if ((all_requests[db_request].approver == request.approver) && (all_requests[db_request].sender == request.sender) && (request.status == "Pending")) {
                request_exists = true
            }
        }
        if (request_exists) {
            alert = `
        <div class="alert alert-info" role="alert">
            Friend request has already been sent to ${name}. 
        </div>
        `
        }
        else {
            firebase.database().ref('/requests/').push(request);
            alert = `
        <div class="alert alert-info" role="alert">
            Friend request has been sent to${name}. 
        </div>
        `
        }
        document.getElementById("alert").innerHTML = alert
        document.getElementById("userid").removeChild
    })
}