const globalDAO = require('../DAL/globalDAO')
const jwt = require('../Helpers/jwt')
const bcrypt = require('bcrypt')
const userDAO = require('../DAL/userDAO')

exports.signup = function(req, res, next) {
    req.body.profile = 'user'
    globalDAO.get('Users', [
            ['email', req.body.email]
        ])
        .then(() => {
            res.status(412).json({ message: 'You need a unique email' })
        })
        .catch(error => {
            if (error.status === 404) {
                globalDAO.create('Users', Object.keys(req.body), Object.values(req.body))
                    .then(response => {
                        response.jwt = jwt.getJwt({ id: response.insertId, profile: response.profile })
                        res.status(201).json(response)
                    })
                    .catch(error => {
                        res.status(error.status).json(error.errorContent)
                    })
            } else {
                res.status(error.status).json(error.errorContent)
            }
        })
}

exports.login = function(req, res, next) {
    globalDAO.get('Users', [
            ['email', req.body.email]
        ])
        .then((rows) => {
            bcrypt.compare(req.body.password, rows[0].Password, (error, passwordIsValid) => {
                if (error) {
                    res.status(500).json(error)
                } else {
                    if (passwordIsValid) {
                        response = req.locals.getDto(rows[0])
                        response.jwt = jwt.getJwt({ id: rows[0].User_id, profile: rows[0].Profile })
                        res.status(200).json(response)
                    } else {
                        res.status(412).json({ message: "Login Failed" })
                    }
                }
            })
        })
        .catch(error => {
            res.status(412).json("Login Failed")
        })
}

exports.getUsers = function(req, res, next) {
    console.log(req.query)
    if (req.query.pseudo === undefined) {
        globalDAO.getAll(req.locals.tableName)
            .then(rows => {
                dtos = rows.map(row => {
                    return req.locals.getDto(row)
                })
                res.status(200).json(dtos)
            })
            .catch(error => {
                res.status(error.status).json(error.errorContent)
            })
    } else {
        userDAO.getUsersThatMatch(req.query.pseudo)
            .then(rows => {
                dtos = rows.map(row => {
                    return req.locals.getDto(row)
                })
                console.log(dtos)
                return res.status(200).json(dtos)
            })
            .catch(error => {
                res.status(error.status).json(error.errorContent)
            })
    }
}