const axios = require('axios')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const secrets = require('./secrets.js')
const db = require('../data/dbConfig.js')
const Users = require('./users-helpers.js')

const {authenticate} = require('../auth/authenticate')

generateToken = (user) =>{
    return jwt.sign({
        userId: user.id,
    }, secrets.jwt, {
        expiresIn:'1d'
    })
}

module.exports = server => {
    server.get('/', welcome)
    server.post('/register', register)
    server.post('/login', login)
    server.get('/financial', authenticate, financial)
    server.get('/shopping', authenticate, shopping)
    server.get('/personal', authenticate, personal)
    server.post('/addBanks/:id', addBanks)
    server.post('/addStoreData/:id', addStoreData)
    server.post('/addPersonal/:id', addPersonalSites)
    server.get('/getUserPersonal/:id', getUserPersonal)
    server.get('/getUserFinancial/:id', getUserFinancial)
    
}

const welcome = (req, res) => {
    res.send('Welcome!')
}

//REGISTER
const register = (req, res) => {
    let user = req.body

    const hash = bcrypt.hashSync(user.password, 10)
    user.password = hash

    Users.add(user)
    .then(saved => {
        const token = generateToken(saved)

        res.status(200).json({
            message: `Welcome ${user.username}`,
            token: token
        })
    })
    .catch(err => {
        res.status(500).json(err)
    })
}

//LOGIN
const login = (req, res) => {
    let {email, password} = req.body

    Users.findBy({email})
    .first()
    .then(user => {
        if(user && bcrypt.compareSync(password, user.password)){
            const token = generateToken(user)

            res.status(200).json({
                message: `Welcome back ${user.username}`,
                token: token
            })
        } else {
            res.status(500).json({message: "Sorry, email or password does not match. Try again."})
        }
    })
    .catch(err => {
        res.status(500).json(err)
    })
}


//GET table data
const financial = (req, res) => {
    db('financial')
        .then(finance => {
            res.status(200).json(finance)
        })
        .catch(err => {
            res.status(500).json(err)
        })
}

const shopping = (req, res) => {
    db('shopping')
        .then(shopping => {
            res.status(200).json(shopping)
        })
        .catch(err => {
            res.status(500).json(err)
        })
}

const personal = (req, res) => {
    db('personal')
        .then(personal => {
            res.status(200).json(personal)
        })
        .catch(err => {
            res.status(500).json(err)
        })
}

//GET Individual user database sites
const getUserFinancial = async(req, res) => {
    let {id} = req.params
//getting user financial sites 
    await db('financial')
        .then(institutions => {
            
           const filtered = institutions.filter( myData => {
                return myData.financial_user_id == id

            })
            console.log(filtered)
            res.status(200).json(filtered)
         
        })
        .catch(err => {
            res.status(500).json(err)
        })
}

const getUserPersonal = async(req, res) => {
    let {id} = req.params
//getting user personal sites 
    await db('personal')
        .then(personal => {
            
           const filtered = personal.filter( myData => {
                return myData.personal_user_id == id

            })
            console.log(filtered)
            res.status(200).json(filtered)
         
        })
        .catch(err => {
            res.status(500).json(err)
        })
}



//CREATE endpoint data
const addBanks = (req, res) => {
    let {id} = req.params
    let bod = req.body

    bod.map(theseBanks => {
        let banksArray = {...theseBanks, financial_user_id: id}

        Users.addFinancial(banksArray)
        .then(newBank => {
            res.status(200).json({message: "Successfully added an institution "})
        })
        .catch(err =>  {
            res.status(500).json(err)
        })
    })

}

const addStoreData  = (req, res) => {
    let {id} = req.params
    let bod = req.body

    bod.map(theseStores => {
        let StoreArray = {...theseStores, shopping_user_id: id}

        Users.addStores(StoreArray)
        .then(newStore => {
            res.status(200).json({message: "Successfully added a Store "})
        })
        .catch(err =>  {
            res.status(500).json(err)
        })

    })

}



const addPersonalSites = (req, res) => {

    let{id} = req.params
    let bod = req.body
    
    bod.map(theseSites => {
        let SitesArray = {...theseSites, personal_user_id: id}

        Users.addPersonal(SitesArray)
            .then(newSites => {
                res.status(200).json({message: "Successfully added personal site"})
            })
            .catch(err => {
                res.status(500).json(err)
            })
    })

}




