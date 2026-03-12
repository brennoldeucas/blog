//carregando modulos
    const express = require('express')
    const {engine} = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express()
    const admin = require('./routes/admin.js')
    const path = require('path')
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')
    require('./models/postagens.js')
    const Postagens = mongoose.model("Postagens")
    require('./models/Categoria.js')
    const Categorias = mongoose.model('Categoria')
    const usuarios = require('./routes/usuario.js')
    const passport = require('passport')
    require('./config/auth')(passport)
    const db = require('./config/db')
    
//CONFIGURAÇOES

    //Sessão 
    app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
    }))

    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())
    //middleware
    app.use((req, res, next)=>{
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        res.locals.error = req.flash('error')
        res.locals.user = req.user || null
        next()
    })

    //body Parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())
    //handlebars
    app.engine('handlebars', engine({defaultLayout: 'main'}))
    app.set("view engine", 'handlebars')
    //mongoose
    mongoose.Promise = global.Promise
    mongoose.connect(db.mongoURI).then(()=> {
        console.log("conectado ao banco de dados Mongo")
    }).catch((err)=> {
        console.log("houve um erro: "+err)
    })
    //public
    app.use(express.static(path.join(__dirname, "public")))

    /*app.use((req, res, next)=>{
        console.log('OI EU SOU UM MIDDLEWARE')
        next()
    })*/

//ROTAS
    app.get('/', (req, res)=>{
        Postagens.find().populate("categoria").lean().sort({data: 'desc'}).then((postagens)=>{
            res.render('home', {postagens: postagens})
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro interno")
            res.redirect('/404')
            
        })    
    })

    app.get('/404', (req, res)=>{
        res.send('erro 404!')
    })

    app.get('/postagensRecentes',(req, res)=>{
        Postagens.findOne({slug: req.params.slug}).lean().then((postagens)=>{
            if(postagens){
                res.render('postagens/index', {postagens: postagens})
            }else{
                req.flash("error_msg", "essa postagem nao existe")
                res.redirect('/')
            }
        }).catch((err)=>{
            req.flash("error_msg", "houve um erro interno")
            res.redirect('/')
        })
})

app.get('/categorias', (req, res)=>{
    Categorias.find().lean().then((categorias)=>{
        res.render('categorias/index', {categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg", "houve um erro interno ao listar as categorias")
        res.redirect('/')
    })
})

app.get('/categorias/:slug', (req, res)=>{
    Categorias.findOne({slug: req.params.slug}).lean().then((categorias)=>{
        if(categorias){
            
    Postagens.find({categoria: categorias._id}).lean().then((postagens)=>{

        res.render('categorias/postagens', {
            postagens: postagens,
            categorias: categorias
        })

    }).catch((err)=>{
        req.flash("error_msg", "houve um erro interno")
        res.redirect('/')
    })

        }else{
            req.flash("error_msg", "Essa categoria nao existe")
            res.redirect('/')
        }
    }).catch((err)=>{
        req.flash("error_msg", "houve um erro interno ao carregar a pagina dessa categoria categoria")
        res.redirect('/')
    })
})

app.use('/usuarios', usuarios)
app.use('/admin', admin)

//OUTROS
const port = process.env.PORT || 8081
app.listen(port, ()=>{
    console.log('servidor rodando')
    console.log('banco conectado: ', db.mongoURI)
    console.log('NODE_ENV: ', process.env.NODE_ENV)
})

