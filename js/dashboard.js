function myFunction() {
    if(Cookies.get('showLoader') == undefined) {
        document.getElementById("loader").style.display = "block";
        myVar = setTimeout(showPage, 3000);
    }
    else{
        showPage()
    }
}

function showPage() {
    document.getElementById("loader").style.display = "none";
    document.getElementById("main").style.display = "block";
    Cookies.set('showLoader', false)
}

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
const app = Vue.createApp({
    data() {
        return {
            // for user
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

            // for Feed Slideshow
            newsData: [
                {
                    title: "245 cyclists caught riding on expressways from Jan to Sept as more pick up cycling as hobby",
                    image: "https://static.straitstimes.com.sg/s3fs-public/styles/x_large/public/articles/2021/10/28/mi_cyclist_281021.jpg?itok=jSw1xycI&timestamp=1635410005",
                    author: "Clement Yong",
                    date: "OCT 31, 2021, 5:00 AM SGT",
                    description: "SINGAPORE - The authorities are clamping down on cycling on expressways, with 245 people hauled up between January and September, a figure nearly four times than for the whole of last year.",
                    link: "https://www.straitstimes.com/singapore/245-cyclists-caught-riding-on-expressways-from-jan-to-sept-as-more-pick-up-cycling-as"
                },
                {
                    title: "Cycling path that connects Lakeside and Chinese Garden MRT stations unveiled",
                    image: "https://static.straitstimes.com.sg/s3fs-public/styles/x_large/public/articles/2021/11/01/ac_cyclingpath_011121.jpg?itok=F4V4j1yM&timestamp=1635717074",
                    author: "Nadine Chua",
                    date: "OCT 30, 2021, 9:30 AM SGT",
                    description: "SINGAPORE - Taman Jurong residents can now use a 5.6km-long cycling path that connects Lakeside and Chinese Garden MRT stations to get to schools, parks and markets in the area.",
                    link: "https://www.straitstimes.com/singapore/transport/cycling-path-that-connects-lakeside-and-chinese-garden-mrt-stations-launched"
                },
                {
                    title: "Fines for errant road cyclists to be doubled, new rule to cap size of cycling groups",
                    image: "https://static.straitstimes.com.sg/s3fs-public/styles/x_large/public/articles/2021/10/20/dw-cycling-rules-211020.jpg?itok=7FGuWbZp&timestamp=1634722251",
                    author: "Toh Ting Wei",
                    date: "OCT 20, 2021, 5:30 PM SGT",
                    description: "SINGAPORE - Cyclists caught flouting traffic rules will have to pay a $150 fine from Jan 1 next year, up from $75 now.",
                    link: "https://www.straitstimes.com/singapore/transport/fines-for-errant-road-cyclists-to-be-doubled-govt-accepts-panels-recommendations"
                },
                {
                    title: "Road users welcome 'fair' proposals for cycling rules but some want tougher measures",
                    image: "https://static.straitstimes.com.sg/s3fs-public/styles/x_large/public/articles/2021/10/01/yq-sgcycle-01102021.jpg?itok=qELFvuir&timestamp=1633097767",
                    author: "Toh Ting Wei",
                    date: "OCT 2, 2021, 1:38 PM",
                    description: "SINGAPORE - The decision by a panel not to recommend a bicycle registration or licensing scheme for cyclists has been welcomed by road users, who said licences would have been overkill, given the difficulty in enforcement.",
                    link: "https://www.straitstimes.com/singapore/transport/cyclists-welcome-recommendation-saying-no-to-bicycle-registration-but-some"
                },
            ],

            // for Weather components
            city: "Singapore",
            weather: "",
            weather_description: "",
            weather_icon: "",
            temperature: "",
            feels_like: "",
            humidity: "",
            wind_speed: "",

            today_date: "",
            time: "",

            // 5 day forecast
            arrMidday: [],

            requests:[],
            
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

        checkLoginMsg(){
            if (Cookies.get('loginMsg') != undefined) {
                let loginMsg = Cookies.get('loginMsg')
                if(loginMsg == "true") {
                    document.getElementById("loginAlert").style.display = "display"
                    Cookies.set('loginMsg', false)
                }
                else {
                    document.getElementById("loginAlert").style.display = "none"
                }
            }
            else {
                document.getElementById("loginAlert").style.display = "none"
            }
        },

        logout() {
            this.userId = ""
            Cookies.remove('userId')
            Cookies.remove('showLoader')
            Cookies.remove('updated')
            window.location.assign("login-page.html")
        },
        retrieve() {
            this.userId = Cookies.get('userId')
            this.retrieveDetails(this.userId)
            this.retrieveRequests()
            this.checkLoginMsg()
        },
        
        shuffleNews() {
            let currentIndex = this.newsData.slice(1).length, randomIndex

            while(currentIndex != 0){
                randomIndex = Math.floor(Math.random() * currentIndex)
                currentIndex--

                [this.newsData[currentIndex], this.newsData[randomIndex]] =
                [this.newsData[randomIndex], this.newsData[currentIndex]]
            }
            
            return this.newsData
        },
        
        convertDateTimeToDay(dt){
            let datetime = new Date(dt * 1000)
            let day = datetime.toDateString().split(" ")
            return day
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

    // Get Weather
    created() {
        // Add personal OpenWeatherMap API key to appid
        let url = "http://api.openweathermap.org/data/2.5/weather?q=" + this.city  + "&units=metric&appid="

        axios.get(url)
        .then(response => {
            let data = response.data

            this.weather = data.weather[0].main
            this.weather_description = data.weather[0].description
            this.weather_icon = "http://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png"
            this.temperature = data.main.temp.toFixed(0)
            this.feels_like = data.main.feels_like.toFixed(0)
            this.humidity = data.main.humidity
            this.wind_speed = data.wind.speed

            // Replace 1st space with comma
            this.today_date = new Date().toDateString().replace(" ", ", ")

            let datetime = new Date(data.dt * 1000)
            let hours = datetime.getHours()
            let minutes = datetime.getMinutes()
            let am_pm = hours >= 12 ? "pm" : "am"
            hours = hours % 12
            hours = hours ? hours : 12
            minutes = minutes < 10 ? "0" + minutes : minutes

            this.time = hours + ":" + minutes + am_pm

            
            // Background image weather cate
            if (this.weather == "Clear"){
                document.getElementById("weather_div").style.backgroundImage = "url('https://images.financialexpress.com/2020/04/sky1200.jpg?w=1200&h=800&imflag=true')"
                document.getElementById("weather_div").style.backgroundPosition = "center"
                document.getElementById("weather_div").style.backgroundRepeat = "no-repeat"
                document.getElementById("weather_div").style.backgroundSize = "cover"
            }
            if (this.weather == "Rain" || this.weather == "Thunderstorm"){
                document.getElementById("weather_div").style.backgroundImage = "url('https://thumbs.gfycat.com/EmbarrassedObedientIncatern-size_restricted.gif')"
                document.getElementById("weather_div").style.backgroundPosition = "center"
                document.getElementById("weather_div").style.backgroundRepeat = "no-repeat"
                document.getElementById("weather_div").style.backgroundSize = "cover"
                document.getElementById("weather_div").style.color = "white"
            }
            if (this.weather == "Clouds"){
                document.getElementById("weather_div").style.backgroundImage = "url('https://i.makeagif.com/media/11-17-2015/66yUib.gif')"
                document.getElementById("weather_div").style.backgroundPosition = "center"
                document.getElementById("weather_div").style.backgroundRepeat = "no-repeat"
                document.getElementById("weather_div").style.backgroundSize = "cover"
            }
            if (this.weather == "Drizzle"){
                document.getElementById("weather_div").style.backgroundImage = "url('https://i0.wp.com/windowscustomization.com/wp-content/uploads/2018/08/rain-2.gif?fit=750%2C386&quality=80&strip=all&ssl=1')"
                document.getElementById("weather_div").style.backgroundPosition = "center"
                document.getElementById("weather_div").style.backgroundRepeat = "no-repeat"
                document.getElementById("weather_div").style.backgroundSize = "cover"
            }
            if (this.weather == "Snow"){
                document.getElementById("weather_div").style.backgroundImage = "url('https://media.giphy.com/media/iOrEjBFFT2IrLTMdKK/giphy.gif')"
                document.getElementById("weather_div").style.backgroundPosition = "center"
                document.getElementById("weather_div").style.backgroundRepeat = "no-repeat"
                document.getElementById("weather_div").style.backgroundSize = "cover"
            }
            if (this.weather == "Mist" || this.weather == "Smoke" || this.weather == "Haze" || this.weather == "Fog"){
                document.getElementById("weather_div").style.backgroundImage = "url('https://www.advancednanotechnologies.com/wp-content/uploads/2019/05/iStock-1055906130.jpg')"
                document.getElementById("weather_div").style.backgroundPosition = "center"
                document.getElementById("weather_div").style.backgroundRepeat = "no-repeat"
                document.getElementById("weather_div").style.backgroundSize = "cover"
            }
            if (this.weather == "Dust" || this.weather == "Sand"){
                document.getElementById("weather_div").style.backgroundImage = "url('https://c.tenor.com/7wJZlnk1gJkAAAAC/dust-storm-arizona.gif')"
                document.getElementById("weather_div").style.backgroundPosition = "center"
                document.getElementById("weather_div").style.backgroundRepeat = "no-repeat"
                document.getElementById("weather_div").style.backgroundSize = "cover"
                document.getElementById("weather_div").style.color = "white"
            }
            if (this.weather == "Squall"){
                document.getElementById("weather_div").style.backgroundImage = "url('https://thumbs.gfycat.com/BlissfulEachAsiandamselfly-size_restricted.gif')"
                document.getElementById("weather_div").style.backgroundPosition = "center"
                document.getElementById("weather_div").style.backgroundRepeat = "no-repeat"
                document.getElementById("weather_div").style.backgroundSize = "cover"
            }
            if (this.weather == "Tornado"){
                document.getElementById("weather_div").style.backgroundImage = "url('https://c.tenor.com/ujvO9sxZWsEAAAAC/tornado-iowa.gif')"
                document.getElementById("weather_div").style.backgroundPosition = "center"
                document.getElementById("weather_div").style.backgroundRepeat = "no-repeat"
                document.getElementById("weather_div").style.backgroundSize = "cover"
                document.getElementById("weather_div").style.color = "white"
            }

        }).catch(error => {
            console.log(error)
        })
        

        // Getting data for 5 day forecast
        let url_for_5DayForecast = "http://api.openweathermap.org/data/2.5/forecast?q=" + this.city  + "&units=metric&appid=8f048e9d3ed48ee330d6275ebb80f25f"

        axios.get(url_for_5DayForecast)
        .then(response => {
            let data = response.data

            for(object of data.list){
                // get weather data at 8am
                if(object.dt_txt.includes("00:00:00")){
                    this.arrMidday.push(object)
                }
            }

        }).catch(error => {
            console.log(error)
        })


    },

    mounted:
        function load() {
            if (Cookies.get('userId') == undefined) {
                window.location.replace('index.html')
            }
            else if (Cookies.get('email') != undefined) {
                Cookies.remove('firstname')
                Cookies.remove('lastname')
                Cookies.remove('photo')
                Cookies.remove('email')
            }
            this.retrieve()
        }
})

const vm = app.mount("#dashboard-main")
