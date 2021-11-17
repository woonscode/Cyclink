const firebaseConfig = {

  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const app = Vue.createApp({
    data() {
        return {
            userId: "",
            password: "",
            cfm_password: "",
            status_message: "",
            valid: null,
        }
    },
    methods: {
        updateDatabase() {
            let userId = this.userId

            firebase.database().ref('users/' + userId).update({
                password: this.password
            })
        },

        // Password Validations
        checkPwd(){
            let pwdCheck = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/gm
            if (this.password == "") {
                this.status_message = "Please fill in password"
                this.valid = false
            }

            else if (this.cfm_password == "") {
                this.status_message = "Please fill in confirm password"
                this.valid = false
            }

            if (this.password != this.cfm_password) {
                this.status_message = "Passwords do not match!"
                this.valid = false
            }

            if (this.password.match(pwdCheck) === null) {
                this.status_message = "Please fill in at least 8 characters, an uppercase, a number and special character"
                this.valid = false
            }
        },

        // Update password in DB
        change_password() {
            // Password
            this.checkPwd()
            
            if (this.valid === null) {
                var user = firebase.database().ref('users/' + this.userId);
                user.once('value').then((snapshot) => {
                    if (snapshot.exists()) {
                        this.updateDatabase()

                        this.status_message = "Password has been updated! Redirecting to login page..."
                        this.valid = true
                        setTimeout(function(){window.location.assign("login-page.html")}, 2800)
                        Cookies.remove('email')
                    }
                    else{
                        this.status_message = "Invalid user"
                        this.valid = false
                    }
                })
            }

        }

    },
    mounted:
        function load() {
            if (Cookies.get('email') == undefined) {
                window.location.replace('login-page.html')
            }
            else {
                this.userId = Cookies.get('userId')
            }
        }

})
const vm = app.mount("#forgotpwd-main")
