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
            uploaded_image_url: "",
            requests: [],
            file_from_event: {},
            new_firstname: "",
            new_lastname: "",
            cfmPwd: ""
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
                this.cfmPwd = data.password
                this.photo = data.photo
                this.new_firstname = data.firstname
                this.new_lastname = data.lastname
            });
        },
        updateFields() {
            var updates = {};
            let valid = true
            
            let pwdCheck = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/gm
            let phoneCheck = /^(8|9)\d{7}$/
            let emailCheck = /^[^@]+@\w+(\.\w+)+\w$/
            if(this.email.match(emailCheck) == null) {
                document.getElementById("email_error").innerHTML = "Invalid email address"
                valid = false
            }
            else {
                document.getElementById("email_error").innerHTML = ""
            }

            if(this.password.match(pwdCheck) == null) {
                document.getElementById("pwd_error").innerHTML = "Password should contain at least 8 characters, an uppercase, a number and special character"
                valid = false
            }
            
            else {
                document.getElementById("pwd_error").innerHTML = ""
            }

            if (this.cfmPwd == "") {
                document.getElementById("cfmpwd_error").innerHTML = "Please fill in confirm password"
                valid = false
            }
            else if (this.password != this.cfmPwd) {
                document.getElementById("cfmpwd_error").innerHTML = "Passwords do not match!"
                valid = false
            }
            else {
                document.getElementById("cfmpwd_error").innerHTML = ""
            }

            if(this.number !="" && this.number.match(phoneCheck) == null){
                document.getElementById("number_error").innerHTML = "Invalid phone number"
                valid = false
            }
            else {
                document.getElementById("number_error").innerHTML = ""
            }

            if(valid) {
                updates['/users/' + this.userId + "/" + 'age'] = this.age;
                updates['/users/' + this.userId + "/" + 'bio'] = this.bio;
                updates['/users/' + this.userId + "/" + 'email'] = this.email;
                updates['/users/' + this.userId + "/" + 'experience'] = this.experience;
                updates['/users/' + this.userId + "/" + 'firstname'] = this.new_firstname
                updates['/users/' + this.userId + "/" + 'gender'] = this.gender;
                updates['/users/' + this.userId + "/" + 'lastname'] = this.new_lastname
                updates['/users/' + this.userId + "/" + 'number'] = this.number;
                updates['/users/' + this.userId + "/" + 'password'] = this.password;
                firebase.database().ref().update(updates);
                if(document.getElementById("image-upload").value != "") {
                    this.upload_image()
                }
                setTimeout(function(){
                    Cookies.set('updated', true)
                    window.location.assign("profile.html")
                 }, 2000);
                
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
            this.retrieveDetails(this.userId)
            this.retrieveRequests()
        },
        edit_image(event) {
            let file = event.target.files[0]
            this.file_from_event = file
            document.getElementById("profile-photo").src = URL.createObjectURL(file)
        },
        upload_image() {
            file = this.file_from_event
            var storageRef = firebase.storage().ref()
            var fileRef = storageRef.child("profile_photos/" + this.userId)
            this.uploaded_image_url = "gs://cyclink-6f587.appspot.com/profile_photos/" + this.userId
            fileRef.put(file).then((snapshot) => {
                this.download_image()
            });
        },
        download_image() {
            var new_photo_ref = firebase.storage().refFromURL(this.uploaded_image_url)
            new_photo_ref.getDownloadURL().then((new_photo_ref) => {
                var updates = {}
                updates['/users/' + this.userId + "/" + 'photo'] = new_photo_ref;
                firebase.database().ref().update(updates);
            })
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
            window.location.replace('index.html')
        }
        this.retrieve()
    }
})
const vm = app.mount("#edit-main")

// Show/Hide Password
const togglePassword = document.querySelector('#togglePassword')
const password = document.querySelector('#password')

togglePassword.addEventListener('click', function (e) {
    // toggle the type attribute
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password'
    password.setAttribute('type', type)
    // toggle the eye slash icon
    this.classList.toggle('fa-eye-slash')
})


// Show/Hide Confirm Password
const toggleCfmPassword = document.querySelector('#toggleCfmPassword')
const cfmpassword = document.querySelector('#cfm_pwd')

toggleCfmPassword.addEventListener('click', function (e) {
    // toggle the type attribute
    const type = cfmpassword.getAttribute('type') === 'password' ? 'text' : 'password'
    cfmpassword.setAttribute('type', type)
    // toggle the eye slash icon
    this.classList.toggle('fa-eye-slash')
})
