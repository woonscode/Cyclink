const firebaseConfig = {

};

firebase.initializeApp(firebaseConfig);

function retrieveDetails(userId) {
    var user = firebase.database().ref('users/' + userId);
    user.on('value', (snapshot) => {
        const data = snapshot.val();

    });
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
            password: "",
            photo: "",
            routes: "",
            requests: [],
            groups: [],
            friends: [],
            users: [],
            newGroupName: "",
            selectedMembers: [],
            totalgrp: 0,
            route_array: [],
            updated: ""


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
                this.routes = data.routes

            });
        },
        checkUpdates() {
            if (Cookies.get('updated') != undefined) {
                this.updated = Cookies.get('updated')
                if (this.updated == "true") {
                    document.getElementById("alert").style.display = "block"
                    Cookies.set('updated', false)
                }
                else {
                    document.getElementById("alert").style.display = "none"
                }
            }
            else {
                document.getElementById("alert").style.display = "none"
            }
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
            this.checkUpdates()
            this.retrieveDetails(this.userId)
            this.retrieveRequests()
            this.getUsers()
            this.getGroups()
            this.getFriends()
        },

        getGroups() {
            var user = firebase.database().ref('groups/');
            user.on('value', (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    let childKey = childSnapshot.key;
                    let childData = childSnapshot.val();
                    let members = childData.members
                    for (member of members) {
                        if (member == this.userId) {
                            this.groups.push({ key: childKey, group: childData })
                            break
                        }
                    }
                    this.totalgrp++
                })


            });
        },


        gotoChat(groupId) {
            return "chat.html?groupid=" + groupId
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

        getUsers() {
            var user = firebase.database().ref('users/');
            user.on('value', (snapshot) => {
                const data = snapshot.val();
                this.users = data

            });
        },
        getFriends() {
            var ref = firebase.database().ref('users/' + this.userId + "/friends/");
            ref.once('value', (snapshot) => {
                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        let childKey = childSnapshot.key;
                        let childData = childSnapshot.val();
                        this.friends.push(childData)
                    })
                }

            })
        },

        createGroup() {
            let grpId = this.totalgrp + 1
            firebase.database().ref('/groups/g' + grpId + '/groupID').set('g' + grpId);
            firebase.database().ref('/groups/g' + grpId + '/groupName').set(this.newGroupName);
            firebase.database().ref('/groups/g' + grpId + '/image').set('images/group_chat.png');
            firebase.database().ref('/groups/g' + grpId + '/members/0').set(this.userId);
            let index = 1
            for (member of this.selectedMembers) {
                firebase.database().ref('/groups/g' + grpId + '/members/' + index).set(member);
                index++
            }
            location.reload()
        },


        leaveGroup(groupID) {
            let index = 0
            var ref = firebase.database().ref('groups/' + groupID + "/members");
            ref.once('value', (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    let members = data
                    for (member of members) {
                        if (member == this.userId) {
                            this.removeFromGrp(groupID, index)
                        }
                        index++
                    }
                }
            })
        },

        removeFromGrp(groupID, index) {
            var ref = firebase.database().ref('groups/' + groupID + "/members/" + index);
            ref.remove()
            location.reload()
        },

        unfriend(friend) {
            var ref = firebase.database().ref('users/' + this.userId + "/friends/");
            ref.once('value', (snapshot) => {
                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        let childKey = childSnapshot.key;
                        let childData = childSnapshot.val();
                        if (childData == friend) {
                            this.removeFriend(childKey)
                        }
                    })
                }

            })
        },

        removeFriend(key) {
            var ref = firebase.database().ref('users/' + this.userId + "/friends/" + key);
            ref.remove()
            location.reload()
        },


        deleteRoute(key) {
            var ref = firebase.database().ref('users/' + this.userId + "/routes/" + key);
            ref.remove()
            location.reload()

        },
        redirectToMap(key) {
            // get start and end point
            var ref = firebase.database().ref('users/' + this.userId + "/routes/" + key);
            ref.once('value', (snapshot) => {
                if (snapshot.exists()) {
                    info = snapshot.val()
                    start = info.start_point
                    end = info.end_point
                    Cookies.set("start", start)
                    Cookies.set("end", end)

                }
            })
            window.location.assign('map.html')

        }


    },

    computed: {
        name() {
            return this.firstname + " " + this.lastname
        },
        getRoutes() {
            var user = firebase.database().ref('users/' + this.userId + '/routes/');
            user.on('value', (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    let index = "route"
                    let route_data = childSnapshot.val()
                    let distance_save = route_data.distance
                    let start_point_save = route_data.start_point
                    let end_point_save = route_data.end_point
                    if (!({ end_point: end_point_save, start_point: start_point_save } in this.route_array)) {
                        this.route_array.push({ key: childSnapshot.key, end_point: end_point_save, start_point: start_point_save })
                    }
                })

            });

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
const vm = app.mount("#main-profile")