const firebaseConfig = {

};

firebase.initializeApp(firebaseConfig);

function show_chat_list(){
    document.getElementById("side_bar").className = "col-sm-12 col-md-3 d-block d-sm-block d-md-none"
    document.getElementById("btn_back").className = "btn d-none"
    document.getElementById("messages").className = "col-sm-12 col-md-9 position-relative d-none"
}

function show_chat(){
    document.getElementById("side_bar").className = "col-sm-12 col-md-3 d-none d-sm-none d-md-block"
    document.getElementById("btn_back").className = "btn d-block"
    document.getElementById("messages").className = "col-sm-12 col-md-9 position-relative d-block"
}

const main = Vue.createApp({
    data() {
        return {
            users: [],
            groups: [],
            messages: [],
            current_username: "",
            current_user: "",
            current_userId: "",
            new_message: "",
            current_groupId: "",
            current_group: {},
            firstname: "",
            lastname: "",
            photo: "",
            requests: [],
            friends: [],
            type: "",
            selected_friend: "",
            nonMembers: [],
            selectedMembers: [],
            haveGrp: "",
            haveFriends: "",
            search: ""
        }
    },
    created() {
        if (Cookies.get('userId') == undefined) {
            window.location.replace('index.html')
        }
        this.retrieve()
    },

    computed: {
        name(){
            return this.firstname + " " + this.lastname
        }
    },
    
    methods: {
        getUsers(){
            var user = firebase.database().ref('users');
            user.on('value', (snapshot) => {
                const data = snapshot.val();
                this.users = data
                this.photo = data[this.current_userId].photo
                this.firstname = data[this.current_userId].firstname
                this.lastname = data[this.current_userId].lastname
            
            });
        },

        getGroups(){
            var user = firebase.database().ref('groups');
            user.once('value', (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                let childKey = childSnapshot.key;
                let childData = childSnapshot.val();
                let members = childData.members
                for(member of members) {
                    if(member == this.current_userId) {
                        this.groups.push({key: childKey, group: childData})
                        break
                    }
                }
            })
            
            if(this.current_groupId == "" && this.groups.length>0 && this.type !="friend") {
                this.current_groupId = this.groups["0"].key
                this.current_group = this.groups["0"].group
                this.haveGrp = true
                this.type = 'group'
            }
            });
        },

        getMessages() {
            var user = firebase.database().ref('messages');
            user.on('value', (snapshot) => {
                const data = snapshot.val();
                this.messages = data
                window.scrollTo(0,document.body.scrollHeight);
            });
        },
        initialiseMessages() {
            var user = firebase.database().ref('messages');
            user.on('value', (snapshot) => {
                const data = snapshot.val();
                if (data == null) {
                    firebase.database().ref('/messages/0/start').set("started");
                    firebase.database().ref('/messages/0/purpose').set("to iterate");
                }
            })
        },
        getFriends() {
            var ref = firebase.database().ref('users/' + this.current_userId + "/friends/");
            ref.once('value', (snapshot) => {
                if(snapshot.exists()){
                    snapshot.forEach((childSnapshot) => {
                        let childKey = childSnapshot.key;
                        let childData = childSnapshot.val();
                        this.friends.push(childData)
                    })
                    this.selected_friend = this.friends["0"]
                    this.haveFriends = true
                }
            })
        },

        retrieveRequests(){
            var ref = firebase.database().ref('requests/');
            ref.once('value', (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    let childKey = childSnapshot.key;
                    let childData = childSnapshot.val();
                    if(childData.approver == this.current_userId && childData.status == "Pending"){
                        let user = this.users[childData.sender]
                        user['userid'] = childData.sender
                        this.requests.push({key: childKey, user: user})
                    }
                })
            })
        },
        
        getImageURL(userID){
            return this.users[userID].photo
        },

        addMessage(){
            let msgID = this.messages.length

            if(this.type == 'friend') {
                firebase.database().ref('/messages/'+ msgID + '/chatID').set(this.selected_friend);
                firebase.database().ref('/messages/'+ msgID + '/userID').set(this.current_userId);
                firebase.database().ref('/messages/'+ msgID + '/message').set(this.new_message);
                firebase.database().ref('/messages/'+ msgID + '/datetime').set(new Date().toString());
            }
            else{
                firebase.database().ref('/messages/'+ msgID + '/chatID').set(this.current_group.groupID);
                firebase.database().ref('/messages/'+ msgID + '/userID').set(this.current_userId);
                firebase.database().ref('/messages/'+ msgID + '/message').set(this.new_message);
                firebase.database().ref('/messages/'+ msgID + '/datetime').set(new Date().toString());
            }
            this.getMessages()
            this.new_message = ""
            window.scrollTo(0,document.body.scrollHeight);
        },

        lastMessage(chat_id) {
            let latestMsg = "[No message]"
            for (msg of this.messages){
                if(msg.chatID == chat_id || (msg.chatID == this.current_userId && msg.userID == chat_id)) {
                    latestMsg = msg.message
                }
            }
            return latestMsg
        },

        lastMessageTime(chat_id) {
            let latestMsg = ''
            for (msg of this.messages){
                if(msg.chatID == chat_id || (msg.chatID == this.current_userId && msg.userID == chat_id)) {
                    latestMsg = new Date(msg.datetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                }
            }
            return latestMsg
        },

        logout() {
            this.current_user = ""
            Cookies.remove('userId')
            Cookies.remove('showLoader')
            Cookies.remove('updated')
            window.location.assign("index.html")
        },

        retrieve() {
            this.current_userId = Cookies.get('userId')
            this.getUsers()
            this.initialiseMessages()
            this.getGroups()
            this.getFriends()
            this.getParameters()
            this.getMessages()
            this.retrieveRequests()
            this.getNonMembers()
        },

        changeCurrent(groupId) {
            this.current_groupId = groupId
            var user = firebase.database().ref('groups/' + groupId);
            user.on('value', (snapshot) => {
            const data = snapshot.val();
            this.current_group = data
            this.type = 'group'
            this.getNonMembers()
            document.getElementById("alert").innerHTML = ""
            })
        },

        changeCurrentFriend(userid) {
            this.selected_friend = userid
            this.type = 'friend'
            document.getElementById("alert").innerHTML = ""
        },

        getParameters() {
            const queryString = window.location.search
            const urlParams = new URLSearchParams(queryString)
            if(queryString){
                if(urlParams.has('groupid')){
                    let groupId = urlParams.get('groupid')
                    this.current_groupId = groupId

                    var user = firebase.database().ref('groups/' + groupId);
                    user.on('value', (snapshot) => {
                    const data = snapshot.val();
                    this.current_group = data
                    this.type = 'group'
                    })
                }
                else if(urlParams.has('friend')) {
                    this.selected_friend = urlParams.get('friend')
                    this.type = 'friend'
                }
            }
        },
        addFriends() {
            let alert = ''
            if(this.selectedMembers.length > 0) {
                let total = this.current_group.members.length
                for(friend of this.selectedMembers){
                    firebase.database().ref('/groups/'+ this.current_groupId + '/members/'+ total).set(friend);
                }
                let friend_str = this.selectedMembers.join(", ")
                alert = `
                <div class="alert alert-info" role="alert">
                    ${friend_str} has been added to the group. 
                </div>
                `
            }
            else {
                alert = `
                <div class="alert alert-warning" role="alert">
                    No friends was selected.
                </div>
                `
            }
            document.getElementById("alert").innerHTML = alert
        },

        getNonMembers() {
            this.nonMembers = []
            var ref = firebase.database().ref('groups/' + this.current_groupId + "/members");
            ref.once('value', (snapshot) => {
                if(snapshot.exists()){
                    const data = snapshot.val();
                    let members = data
                    let total = members.length
                    for( friend of this.friends) {
                        if(!members.includes(friend)){
                            this.nonMembers.push(friend)
                        }
                    }
                }
            })
        },

        leaveGroup() {
            let index = 0
            var ref = firebase.database().ref('groups/' + this.current_groupId + "/members");
            ref.once('value', (snapshot) => {
                if(snapshot.exists()){
                    const data = snapshot.val();
                    let members = data
                    for( member of members) {
                        if(member == this.current_userId) {
                            this.removeFromGrp(index)
                        }
                        index ++
                    }
                }
            })
        },

        removeFromGrp(index) {
            var ref = firebase.database().ref('groups/' + this.current_groupId + "/members/" + index);
            ref.remove()
            location.reload()
        }

    },
})

const vm = main.mount("#app")