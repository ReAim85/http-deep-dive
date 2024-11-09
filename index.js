const express = require('express');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken');
const {v4 : uuidv4} = require('uuid');
const JWT_SECRET = "Vishal@85"
const app = express();

app.use(express.json());

async function readBE() {
    try{
        const data = await fs.readFile('user.json');
        return JSON.parse(data) || [];   
    } catch(err) {
        return [];
    }
}

async function writeBE(info) {
    await fs.writeFile("user.json", JSON.stringify(info, null, 2));
}

app.post('/signup', async function(req, res){
    try{
        let user = await readBE();
        if (user.find(u => u.username === req.body.username)){
            res.send({
                'msg': "you are already signedup"
            });
            return;
        }
        user.push({
            username: req.body.username,
            password: req.body.password,
            token: null
        })

        await writeBE(user);
        res.send({
            "msg": "signup successfully"
        })
    } catch(err){ 
        res.status(500).send({
            "msg" : "error on our side" 
        })
    }
})

app.post('/signin', async function(req, res){
    try{
    let user = await readBE();
    const userIndex = user.findIndex(u => u.username === req.body.username && u.password === req.body.password)
    if(userIndex !== -1) {
        const token = jwt.sign({
            username: user[userIndex].username
        }, JWT_SECRET);
        // user[userIndex].token = token;
        // await writeBE(user);
        res.send({
            "msg": "signedin successfuly",
            "token": token
        })
    } else {
        res.send({
            "msg": "wrong username or password"
        })
    }
} catch(err){
    res.status(500).send({
        "msg": "error on our side"
    })
    return
}

})

app.post('/me', async function(req, res) {
    try{
    let user = await readBE();
    const token = req.headers.authorization;
    const decodedInfo = jwt.verify(token, JWT_SECRET);
    if(!decodedInfo){
        res.status(404).send({
            "msg": "UNAUTHORIZED"
        })
    }
    const username = decodedInfo.username;
    const isUser = user.find(u => u.username === username)
    if(isUser){
        res.send({
            'username': isUser.username,
            'password': isUser.password
        })
    } else {
        res.status(404).send({  
            "msg": "UNAUTHORIZED"
        })
    }
} catch(err){
    res.status(500).send({
        "msg": "error hai kuch"
    })
}

})


app.listen(3000);