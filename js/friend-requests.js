const firebaseConfig = {

  };
    
firebase.initializeApp(firebaseConfig);

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
            password: "",
            photo: "",
            requests: [],
            users: [],
        }
    },

    methods: {
        retrieveDetails(userId) {
            var user = firebase.database().ref('users/' + userId);
            user.on('value', (snapshot) => {
                const data = snapshot.val();
                this.firstname = data.firstname
                this.lastname = data.lastname
                this.photo = data.photo
            });
        },

        retrieveRequests(){
            var ref = firebase.database().ref('requests/');
            ref.once('value', (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    let childKey = childSnapshot.key;
                    let childData = childSnapshot.val();
                    if(childData.approver == this.userId && childData.status == "Pending"){
                        let user = this.users[childData.sender]
                        user['userid'] = childData.sender
                        this.requests.push({key: childKey, user: user})
                    }
                })
            })
        },

        getUsers(){
            var user = firebase.database().ref('users');
            user.on('value', (snapshot) => {
            const data = snapshot.val();
            this.users = data
            
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
            this.getUsers()
            this.retrieveRequests()
        },

        accept(friend, key) {
            firebase.database().ref('/users/' + this.userId + "/friends/").push(friend);
            firebase.database().ref('/users/' + friend + "/friends/").push(this.userId);
            firebase.database().ref('/requests/' + key + "/status").set("Approved")
            this.removeRequest(key)
            let alert = `
                <div class="alert alert-success" role="alert">
                You have accepted ${friend} friend request!
                </div>
            `
            document.getElementById("alert").innerHTML = alert

        },

        reject(friend, key) {
            firebase.database().ref('/requests/' + key + "/status").set("Rejected")
            this.removeRequest(key)
            let alert = `
                <div class="alert alert-danger" role="alert">
                You have rejected ${friend} friend request!
                </div>
            `
            document.getElementById("alert").innerHTML = alert
        },

        removeRequest(key) {
            let index = 0
            for( request of this.requests) {
                if(request.key == key){
                    this.requests.splice(index, 1)
                    break
                }
                index ++
            }
        }    
    },
    computed: {
        name() {
            return this.firstname + " " + this.lastname
        },
        
    },
    mounted: 
    function load() {
        if (Cookies.get('userId') == undefined) {
            window.location.replace('index.html')
        }
        this.retrieve()
    }
})

const vm = app.mount("#app")