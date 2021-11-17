const firebaseConfig = {

  };

// Initialize Firebase

firebase.initializeApp(firebaseConfig);



function retrieveDetails(userId) {
    var user = firebase.database().ref('users/' + userId);
    user.on('value', (snapshot) => {
        const data = snapshot.val();
    });
}

function sendRequest(name, userid) {
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
            Friend request has been sent to ${name}. 
        </div>
        `
    }
    document.getElementById("alert").innerHTML = alert
})

}

const app = Vue.createApp({
    data() {
        return {
            userId: "",
            age: "",
            bio: "",
            email: "",
            experience: "",
            firstname: "",
            gender: "",
            lastname: "",
            number: "",
            photo: "",
            username: "",
            password: "",
            status_message: "",
            valid: null,
            name_list: [],
            friendName: "",
            firstname: "",
            lastname: "",
            photo: "",
            requests: [],
            sentRequests: [],
            friendlist: [],
            users: [],
            potentialUsers:{}
        }
    },
    methods: {
        retrieveDetails(userId) {
            var user = firebase.database().ref('users/' + userId);
            user.on('value', (snapshot) => {
                const data = snapshot.val();
                this.age = data.age
                this.bio = data.bio
                this.email = data.email
                this.experience = data.experience
                this.firstname = data.firstname
                this.gender = data.gender
                this.lastname = data.lastname
                this.number = data.number
                this.password = data.password
                this.photo = data.photo
            });
        },

        checkIfUserExists(userId, password) {
            var user = firebase.database().ref('users/' + userId);
            user.once('value').then((snapshot) => {
                if (snapshot.exists()) {

                    // Retrieving pw?
                    if (password == snapshot.val().password) {
                        Cookies.set('userId', userId)
                        window.location.assign("dashboard.html")
                    }
                    else {
                        this.status_message = "Username and password is empty."
                        this.valid = false
                    }
                }
                else {
                    this.status_message = "Username or password is incorrect."
                    this.valid = false
                }
            });
        },

        getUsers(){
            var user = firebase.database().ref('users');
            user.on('value', (snapshot) => {
                const data = snapshot.val();
                this.users = data

            
            });
        },

        sendRequest(name, userid) {
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
                    Friend request has been sent to ${name}. 
                </div>
                `
            }
            document.getElementById("alert").innerHTML = alert
            document.getElementById(userid).innerHTML = "<span>Friend request sent.</span>"
        })
        
        },

        checkAllUsers(friendName) {
            var user = firebase.database().ref('users/')
            user.once('value').then((snapshot) => {
                let all_users = snapshot.val()
                // Initialize getting all the friends
                this.getFriends()

                for (indiv_userid in all_users) {
                    // For each indiv user
                    let indivUser = all_users[indiv_userid]

                    // For each indiv user details and storing in variable
                    let small_indivUser = indivUser.firstname.toLowerCase()
                    let indivUser_firstname = indivUser.firstname
                    let indivUser_lastname = indivUser.lastname
                    let indivUser_photo = indivUser.photo
                    let age = indivUser.age
                    let experience = indivUser.experience
                    let small_friendName = friendName.toLowerCase()


                    // To ensure that the current user has users
                    if (this.friendlist.length != 0) {

                        // Iterate through user's friendlist
                        for (friend_user of this.friendlist) {
                            // Condition to test that his own card does not show up
                            // Test whether the potential friend has not been added already
                            if ((this.userId != indiv_userid) && (indiv_userid != friend_user)) {  
                                // condition to ensure name matches input in the text which is retrieved via v-model
                                if (small_indivUser.includes(small_friendName)) {
                                    let added = false
                                    for (requestor of this.sentRequests) {
                                        if(requestor == indiv_userid) {
                                            this.name_list.push({ "userid": indiv_userid, "firstname": indivUser_firstname, "lastname": indivUser_lastname, "age": age, "experience": experience, "photo": indivUser_photo, "request": true})
                                            added = true
                                            break
                                        }
                                    }
                                    if(!added) {
                                        this.name_list.push({ "userid": indiv_userid, "firstname": indivUser_firstname, "lastname": indivUser_lastname, "age": age, "experience": experience, "photo": indivUser_photo, "request": false})
                                        break
                                    }
                                    
                                    
                                }
                            }
                        }
                    }
                    else {
                        // Condition to test that his own card does not show up
                        if (this.userId != indiv_userid) {
                            // condition to ensure name matches input in the text which is retrieved via v-model
                            if (small_indivUser.includes(small_friendName)) {
                                let added = false
                                for (requestor of this.sentRequests) {
                                    if(requestor == indiv_userid) {
                                        this.name_list.push({ "userid": indiv_userid, "firstname": indivUser_firstname, "lastname": indivUser_lastname, "age": age, "experience": experience, "photo": indivUser_photo, "request": true})
                                        added = true
                                        break
                                    }
                                }
                                if(!added) {
                                    this.name_list.push({ "userid": indiv_userid, "firstname": indivUser_firstname, "lastname": indivUser_lastname, "age": age, "experience": experience, "photo": indivUser_photo, "request": false})
                                    break
                                }
                            }
                        }
                    }
                }

                // Implementing the card function
                str = ``
                if (this.friendName != "") {
                    for (value of this.name_list) {
                        if(value.request){
                            str += `
                            <div class="col my-2 mx-auto" style="width: 18rem; text-align:center">
                                <div class="card cardStack">
                                    <img src="${value.photo}" class="card-img-top rounded mx-auto d-block mt-3" alt="..." style="width: 50%; height: 50%;">
                                    <div class="card-body">
                                        <h4 class="card-title">${value.firstname} ${value.lastname}</h4>
                                        <span>Friend request sent.</span>
                                    </div>
                                </div>
                            </div>
                        `
                        }
                        else {
                            str += `
                            <div class="col my-2 mx-auto" style="width: 18rem; text-align:center">
                                <div class="card cardStack">
                                    <img src="${value.photo}" class="card-img-top rounded mx-auto d-block mt-3" alt="..." style="width: 50%; height: 50%;">
                                    <div class="card-body">
                                        <h4 class="card-title">${value.firstname} ${value.lastname}</h4>
                                        <a onclick="sendRequest('${value.firstname} ${value.lastname}', '${value.userid}')" class="btn btn-primary addFriendButton">Add Friend</a>
                                    </div>
                                </div>
                            </div>
                        `
                        }
                    }
                }

                // to check if there is any results or friends of that name is found
                if (this.name_list.length == 0) {
                    str = ``
                    str += `
                        <h6>No results found for "${friendName}"</h6>
                    `
                    document.getElementById("notFound").innerHTML = str
                }
                else {
                    document.getElementById("notFound").innerHTML = ""
                }

                // to reset the namelist so that it doesn't contain the previous content
                this.name_list = []
                this.friendlist = []
            });
        },

        getFriends() {
            var ref = firebase.database().ref('users/' + this.userId + "/friends/");
            ref.once('value', (snapshot) => {
                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        let childKey = childSnapshot.key;
                        let childData = childSnapshot.val();
                        this.friendlist.push(childData)
                    })
                }

            })
        },

        potentialFriends() {
            let users = {}
            for(key in this.users) {
                if(key != this.userId && !this.friendlist.includes(key) && this.friendName != '' && (this.users[key].firstname.toLowerCase().includes(this.friendName.toLowerCase()) ||this.users[key].lastname.toLowerCase().includes(this.friendName.toLowerCase()))) {
                    users[key] = this.users[key]
                }
            }
            this.potentialUsers = users
        },

        retrieveDetails(userId) {
            var user = firebase.database().ref('users/' + userId);
            user.on('value', (snapshot) => {
                const data = snapshot.val();
                this.firstname = data.firstname
                this.lastname = data.lastname
                this.photo = data.photo
            });
        },
        logout() {
            this.userId = ""
            Cookies.remove('userId')
            Cookies.remove('showLoader')
            Cookies.remove('updated')
            window.location.assign("index.html")
        },
        retrieve() {
            this.userId = Cookies.get('userId')
            this.retrieveDetails(this.userId)
            this.retrieveRequests()
            this.retrieveSentRequests()
            this.getUsers()
            this.getFriends()
        },
        retrieveRequests() {
            var ref = firebase.database().ref('requests/');
            ref.once('value', (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    let childKey = childSnapshot.key;
                    let childData = childSnapshot.val();
                    if (childData.approver == this.userId && childData.status == "Pending") {
                        this.requests.push(childData.sender)
                    }
                })
            })
        },

     
        retrieveSentRequests() {
            var ref = firebase.database().ref('requests/');
            ref.once('value', (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    let childKey = childSnapshot.key;
                    let childData = childSnapshot.val();
                    if (childData.sender == this.userId && childData.status == "Pending") {
                        this.sentRequests.push(childData.approver)
                    }
                })
            })
        },


    },
    computed: {
        name() {
            return this.firstname + " " + this.lastname
        },
        
    },

    mounted:
        function load() {
            if (Cookies.get('userId') == undefined) {
                window.location.assign('index.html')
            }

            this.retrieve()
        }

})
const vm = app.mount("#main")