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


// Decode Jwt without library
function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload)
};

function handleCredentialResponse(response) {
    // decodeJwtResponse() is a custom function defined by you
    // to decode the credential response.
    const responsePayload = parseJwt(response.credential);

    checkAllUsers(responsePayload.email)
    Cookies.set("firstname", responsePayload.given_name)
    Cookies.set("lastname", responsePayload.family_name)
    Cookies.set("email", responsePayload.email)
}

const firebaseConfig = {

};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

function checkAllUsers(email) {
  var user = firebase.database().ref('users/')
  user.once('value').then((snapshot) => {
    let user_found = false
    let all_users = snapshot.val()
    for (userId in all_users) {
      if (all_users[userId].email == email) {
        Cookies.set('userId', userId)
        user_found = true
        window.location.assign("dashboard.html")
      }
    }
    if (user_found == false) {
      window.location.assign("register-page.html")
    }
  });
}

// Send email to reset pwd
function sendEmail(email) {
  Email.send({
    // SecureToken: "",
    Host: "smtp.outlook.com",
    Username: "cyclink-app-create-g6@outlook.com",
    Password: "",
    To: email,
    From: "cyclink-app-create-g6@outlook.com",
    Subject: "Reset Password Instructions",
    Body: "<html>Hello " + email + "!</br></br>Someone has requested a link to change your password. You can do this through the link below.</br></br><a href='https://cyclink.ap-southeast-1.elasticbeanstalk.com/forgot-pwd.html'>Change my password</a></br></br>If you didn't request this, please ignore this email.</br></br></html>",
  })
    .then(function (message) {
      if (message == "OK"){
        console.log("Mail has been sent successfully")
      }
      else {
        console.log(message)
      }
    });
}

const app = Vue.createApp({
  data() {
      return {
        username: localStore()[0],
        password: localStore()[1],
        email: "",
        status_message: "",
        valid: null,
        valid_user: null,
      }
  },
  methods: {
        checkIfUserExists(userId, password) {
        if(userId == ""){
          this.status_message = "Username is empty."
          this.valid = false
        }
        else if(password == ""){
          this.status_message = "Password is empty."
          this.valid = false
        }
        else{
          // Check if user exists and password is the same as DB
          var user = firebase.database().ref('users/' + userId);
          user.once('value').then((snapshot) => {
            if(snapshot.exists()) {
              if (password == snapshot.val().password) {
                Cookies.set('userId', userId)
                Cookies.set('loginMsg', true)
                window.location.assign("dashboard.html")
              }
              else {
                this.status_message = "Username or password is incorrect."
                this.valid = false
              }
            }
            else {
              this.status_message = "Username or password is incorrect."
              this.valid = false
            }
          });
        }
        
      },

      checkAllUsers_ForgetPassword(email) {
        var user = firebase.database().ref('users/')
        user.once('value').then((snapshot) => {
          let user_found = false
          let all_users = snapshot.val()

          // check if email exists in DB, then send email to reset pwd
          for (userId in all_users) {
            if (all_users[userId].email == email) {
              Cookies.set('userId', userId)
              Cookies.set('email', email)
              user_found = true

              sendEmail(email)

              this.status_message = "Email has been sent! Please check your email/spam folder."
              this.valid_user = false
            }
          }

          // Validation for email
          if (user_found == false) {
            let emailCheck = /^[^@]+@\w+(\.\w+)+\w$/
            if (email == "") {
                this.status_message = "Please fill in email."
                this.valid_user = false
            } else if (email.match(emailCheck) === null){
                this.status_message = "Invalid email address."
                this.valid_user = false
            } else {
              this.status_message = "Email address does not exist."
              this.valid_user = false

            }
          }
        });
      }
      
  }, 
  computed: {
  },
  mounted: 
  function load() {
      // check if login button clicked
      if (Cookies.get('userId') != undefined && this.valid) {
          window.location.assign('dashboard.html')
      }
  }
  
})
const vm = app.mount("#main")


// Show/Hide Password
const togglePassword = document.querySelector('#togglePassword')
const password = document.querySelector('#password')

togglePassword.addEventListener('click', function (e) {
  // toggle the type attribute
  const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
  password.setAttribute('type', type)
  // toggle the eye slash icon
  this.classList.toggle('fa-eye-slash')
});

// Remember me function
let rmCheck = document.getElementById("rememberMe")
let username = document.getElementById("username")
let pwd = document.getElementById("password")

if (localStorage.checkbox && localStorage.checkbox !== "") {
  rmCheck.setAttribute("checked", "checked")
  username.value = localStorage.username
  pwd.value = localStorage.pwd
} 
else {
  rmCheck.removeAttribute("checked")
  username.value = ""
  pwd.value = ""
}

function localStore(){
  let login = []

  if (localStorage.username !== "" && localStorage.pwd !== ""){
    login.push(localStorage.username, localStorage.pwd)
  }
  else {
    login.push("", "")
  }
  return login
}

function checkRememberMe() {
  if (rmCheck.checked && username.value !== "") {
    localStorage.username = username.value;
    localStorage.pwd = pwd.value;
    localStorage.checkbox = rmCheck.value;
  } else {
    localStorage.username = "";
    localStorage.pwd = "";
    localStorage.checkbox = "";
  }
}