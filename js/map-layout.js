const app = Vue.createApp({
    data() {
        return {
          firstname: "",
          lastname: "",
          photo: "",
          requests: []
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
        },
        retrieveRequests(){
            var ref = firebase.database().ref('requests/');
            ref.once('value', (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    let childKey = childSnapshot.key;
                    let childData = childSnapshot.val();
                    if(childData.approver == this.userId && childData.status == "Pending"){
                        this.requests.push(childData.sender)
                    }
                })
            })
        },
    },
    computed: {
        name() {
            return this.firstname + " " + this.lastname
        }
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