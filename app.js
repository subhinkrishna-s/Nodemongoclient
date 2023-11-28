import Express from "express"
import ejs from 'ejs'
import bodyParser from "body-parser"
import mongoose from "mongoose"
import session from 'express-session'
import mongodbsession from 'connect-mongodb-session'


mongoose.connect('mongodb://127.0.0.1:27017/skdb').then(()=>{
    console.log("MongoDB connected")
}).catch((err)=>{
    console.log(err)
})

const MongoDBStore = mongodbsession(session);
const store = new MongoDBStore({
  uri: 'mongodb://127.0.0.1:27017/skdb',
  collection: 'sessions'
});

store.on('error', (error) => {
    console.log(error);
  });
const App = Express()

App.set('view engine', 'ejs')
App.use(bodyParser.urlencoded({extended:true}))

App.use(
    session({
      secret: 'sk dbs secret key',
      resave: false,
      saveUninitialized: false,
      store: store,
    })
  )

//User Schema
const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
})

//model
const User = mongoose.model('Users', userSchema)


App.listen(3000, () => {
    console.log('Server is running on port 3000');
})



App.get('/', (req, res)=>{
    res.render('index')
})
App.get('/login', (req, res)=>{
    res.render('login')
})
App.get('/dashboard', async(req, res)=>{
    let data = await User.find()
    res.render('dashboard', {user: data})
})




App.post('/registeruser', async(req,res)=>{
    let {username, password} = req.body

    let alldata = await User.find()
    console.log('All data:', alldata)

    let dbdata = await User.findOne({username: username})
    let data = new User({
        username: username,
        password: password
    })
    console.log('Entered user:', data)
    console.log('DB user:', dbdata)

    if(dbdata){
        res.json('User already Exist:')
    }
    else{
        await data.save()
        res.render('login')
    }

})

App.post('/loginuser', async(req,res)=>{
    let {username, password} = req.body

    let dbdata = await User.findOne({username: username})
    let data = await User.find()

    if(dbdata){
        console.log('user found')
        res.render('dashboard', {user: data})
    }else{
        res.json('user not found')
    }  
})
