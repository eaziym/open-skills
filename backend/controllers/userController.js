const bcrypt = require('bcrypt')
const User = require('../models/userModel')
const Skill = require('../models/skillModel')
const jwt = require('jsonwebtoken')
const { generateUsername } = require("unique-username-generator")   // https://www.npmjs.com/package/unique-username-generator


async function getUniqueUsername (){
    let username, condition
    do {
        username = generateUsername("", 0, 15)
        condition = await User.findOne({username})
    } while(condition)
    return username
} 


function tokenize(username, email, timeInMs){
    const token = jwt.sign(
        {username, email}, 
        process.env.SECRET_KEY, 
        {expiresIn: timeInMs}
    )
    return token
}


function detokenize(token){
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY)
    return decodedToken
}


const authCheck = async (req, res, next) => {
    if(req.cookies === undefined) {
        console.log("Cookies undefined, redirecting to login page.")
        return res.status(300).redirect('/login')
    }

    const token = req.cookies.token

    try {
        const decodedToken = detokenize(token)

        const userExists = await User.findOne({email:decodedToken.email, username:decodedToken.username})

        if(userExists) console.log("\nSession authenticated successfully\n")

        next()

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.error("\nToken expired\n")

            res.clearCookie('token')
            res.status(200).json({ message: "Session expired, please login again." })
        }
        else{
            console.error("\nFailed to verify token:", error)
    
            // Handle invalid token error
            res.status(401).json({ error: "Unauthorized" })
        }
        // HANDLE REDIRECT TO LOGIN PAGE IN FRONTEND !!
    }
}


const login = async(req, res) => {
    const userExists = await User.findOne({email:req.body.email})
    const passwordMatches = await bcrypt.compare(req.body.password, userExists.password)
    const expiresInMs = 3600000*1  // 1 hr = 3600000 ms

    if(userExists && passwordMatches){
        const token = tokenize(userExists.username, userExists.email, expiresInMs)
        res.cookie('token', token, {httpOnly:true, maxAge: expiresInMs})
        console.log("User logged in successfully.")
        // console.log(`token : ${token}`)
        res.status(200).json("User logged in successfully !")
    }
    else {
        res.status(400).json("Invalid user  OR  wrong username-password ")
    }
}



const registerUser = async (req, res)=> {
    const username = await getUniqueUsername()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    try {
        if(
            req.body.fname && req.body.fname.length < 20 &&
            req.body.lname && req.body.lname.length < 20 &&
            req.body.email && emailRegex.test(req.body.email) &&
            req.body.password && req.body.password.length > 6 && req.body.password.length < 20
        ) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const newUser = await User.create({
                ...req.body,
                password: hashedPassword,
                username: username
            })
            console.log("User created !!")
            res.status(201).json("User created !")
        }
        else {
            return res.status(401).send({message: "\nRejected user creation, input criteria not followed !\n"})
        }
    } catch (err) {
        res.status(400).json({error:err.message})
    }

}


// fetch a profile using ID 
const viewProfile = async (req, res) => {
    try {
        // Fetching list of skills
        const allSkills = await Skill.find()

        // Finding user by ID
        const thisUser = await User.findOne({ _id: req.body._id })
        
        if (!thisUser) {
            return res.status(404).json({ error: 'User not found' })
        }

        const profile = {
            fname: thisUser.fname,
            lname: thisUser.lname,
            email: thisUser.email,
            skills: thisUser.skills.map(element => allSkills.find(skill => skill._id.equals(element)).name),
            interests: thisUser.interests.map(element => allSkills.find(interest => interest._id.equals(element)).name)
        }
        res.status(200).json(profile)
    } catch(err) {
        console.log("\nFailed to fetch user details !\n")
        res.status(400).json({ error: err.message })
    }
}


// outputs lists of matchs (fullname + id)
const getMatches = async (req, res) => {
    try {
        const thisUser = await User.findOne({ _id: req.body._id })

        const matchList = await Promise.all(thisUser.matches.map(id => User.findOne({_id:id})))
        const matches = matchList.map(match => {
            return{
                name:`${match.fname} ${match.lname}`,
                id:match._id
            }
        })
        console.log(matches)

        if (matches.length > 0) {
            res.status(200).json(matches);
        } else {
            res.status(200).json("No matches yet :(");
        }
    } catch(err) {
        console.log("\nError finding matches !\n")
        res.status(400).json({ error: err.message })
    }
}



module.exports = {registerUser, viewProfile, getMatches, login, authCheck}