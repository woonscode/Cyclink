function login_over_style() {
    document.getElementById("login_btn").style.color = "white"
    document.getElementById("login_btn").style.backgroundColor = "#BFBFF3"
}

function login_out_style() {
    document.getElementById("login_btn").style.color = "#6C5CE7"
    document.getElementById("login_btn").style.backgroundColor = "white"
}

function started_over_style() {
    document.getElementById("get_started").style.color = "white"
    document.getElementById("get_started").style.backgroundColor = "#BFBFF3"
}

function started_out_style() {
    document.getElementById("get_started").style.color = "#6C5CE7"
    document.getElementById("get_started").style.backgroundColor = "white"
}

const firebaseConfig = {

  };

// Initialize Firebase
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
            gender: "Prefer not to say",
            lastname: "",
            number: "Unknown",
            password: "",
            cfm_password: "",
            photo: "images/default_cyclist.png",
            status_message: "",
            valid: null,
        }
    },
    methods: {
        writeToDatabase() {
            let userId = this.userId
            let firstname = this.firstname.charAt(0).toUpperCase() + this.firstname.slice(1)
            let lastname = this.lastname.charAt(0).toUpperCase() + this.lastname.slice(1)
            
            firebase.database().ref('users/' + userId).set({
                age: this.age,
                bio: this.bio,
                email: this.email,
                experience: this.experience,
                firstname: firstname,
                gender: this.gender,
                lastname: lastname,
                number: this.number,
                password: this.password,
                photo: this.photo,
            },
            )
        },

        register() {

            this.valid = null
            // Check Username
            if (this.userId == "") {
                this.status_message = "Please fill in username!"
                this.valid = false
            }

            // Check Password
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

            if (this.age == "") {
                this.status_message = "Please fill in age"
                this.valid = false
            }

            if (this.years_exp == "") {
                this.status_message = "Please select your years of cycling experience"
                this.valid = false
            }

            // Email
            let emailCheck = /^[^@]+@\w+(\.\w+)+\w$/
            if (this.email == "") {
                this.status_message = "Please fill in email"
                this.valid = false
            } else if (this.email.match(emailCheck) === null) {
                this.status_message = "Invalid email address"
                this.valid = false
            }

            // Name
            if (this.firstname == "") {
                this.status_message = "Please fill in first name"
                this.valid = false
            }

            if (this.lastname == "") {
                this.status_message = "Please fill in last name"
                this.valid = false
            }

            // Check if username already exists in DB else add user in DB
            if (this.valid === null) {
                var user = firebase.database().ref('users/' + this.userId);
                user.once('value').then((snapshot) => {
                    if (snapshot.exists()) {
                        this.status_message = "Username is already taken!"
                        this.valid = false
                    }
                    else {
                        this.valid = true
                        this.writeToDatabase()
                        Cookies.set('userId', this.userId)
                        window.location.assign("dashboard.html")
                    }
                })
            }

        }

    },
    mounted:
        function load() {
            if (Cookies.get('email') != undefined) {
                this.firstname = Cookies.get('firstname')
                this.lastname = Cookies.get('lastname')
                this.email = Cookies.get('email')
            }
        }

})
const vm = app.mount("#register-main")


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
