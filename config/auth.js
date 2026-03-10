const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

require('../models/usuario')
const Usuario = mongoose.model('Usuarios')

module.exports = function(passport){

    passport.use(new localStrategy(
        {usernameField: 'email', passwordField: 'senha'},
        (email, senha, done)=>{

            Usuario.findOne({email: email}).then((usuarios)=>{

                if(!usuarios){
                    return done(null, false, {message: "Esta conta nao existe"})
                }

                bcrypt.compare(senha, usuarios.senha, (erro, batem)=>{

                    if(batem){
                        return done(null, usuarios)
                    }else{
                        return done(null, false, {message: "credenciais invalidas"})
                    }

                })

            })

        }
    ))

    passport.serializeUser((usuarios, done)=>{
        done(null, usuarios.id)
    })


    passport.deserializeUser((id, done) => {
    Usuario.findById(id).lean()
        .then(usuario => done(null, usuario))
        .catch(err => done(err, null))
    })
}