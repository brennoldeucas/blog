const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model("Categoria")
let mensagemSucesso = false
require('../models/postagens')
const Postagens = mongoose.model('Postagens')
const {eAdmin}= require("../helpers/eAdmin")

router.get('/', eAdmin, (req, res)=>{
    res.render('admin/index')
})

router.get('/categorias', eAdmin, (req, res)=>{

    Categoria.find().sort({date: 'desc'}).lean().then((categorias) => {

        console.log(categorias)
        res.render('admin/categorias',{
            categorias: categorias,
            Sucesso: mensagemSucesso
        })

        }).catch((err) => {

            req.flash("error_msg", "Houve um erro ao listar ao listar as categoria")
            res.redirect('/admin')
            
        })
        mensagemSucesso = false   
})

router.get('/categorias/add', eAdmin, (req, res)=>{
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', eAdmin, (req, res)=> {

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined||req.body.nome == null){
        erros.push({texto: "Nome invalido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "nome da categoria é muito pequeno"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined||req.body.slug == null){
        erros.push({texto: "slug invalido"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
    }

    new Categoria(novaCategoria).save().then(()=>{
        mensagemSucesso = true
        console.log('categoria salva com sucesso')
        res.redirect('/admin/categorias')
    }).catch((err)=>{
        mensagemSucesso = false
        console.log('houve um erro'+err)
    })
}
 
})

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render('admin/editcategorias', {categoria: categoria})
    }).catch((err) =>{
        req.flash("error_msg", "esta categoria nao existe")
        res.redirect('/admin/categorias')
    })
    
})

router.post("/categorias/edit", eAdmin, (req, res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(()=>{
            req.flash("success_msg", "categoria registrada com sucesso")
            res.redirect("/admin/categorias")
        }).catch(()=>{
            req.flash("error_msg", "houve um erro interno ao salvar a edição")
        })

    }).catch((err)=>{
        req.flash("error_msg", "houve um erro ao editar a categoria")
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/deletar', eAdmin, (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "categoria registrada com sucesso")
        res.redirect("/admin/categorias")
    }).catch((err)=>{
        req.flash("error_msg", "houve um erro ao deletar a categoria")
        res.redirect("/admin/categorias")
    })
})

router.get('/postagens', eAdmin, (req, res)=>{
    Postagens.find().populate('categoria').sort({data: "desc"}).lean().then((postagens)=> {
        res.render('admin/postagens', {postagens: postagens})
    }).catch((err)=>{
         req.flash("error_msg", "houve um erro ao listar as postagens")
         res.redirect('/admin')
    })
    
})

router.get('/postagens/add', eAdmin, (req, res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render('admin/addpostagens', {categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg", "houve um erro ao deletar a categoria")
        res.redirect("/admin")
    })   
})

router.post("/postagens/nova", eAdmin, (req, res)=>{

     console.log(req.body)
     
    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto: "categoria invalida, registre uma categoria"})
    }

    if(erros.length > 0){
        Categoria.find().lean().then((categorias)=>{
            res.render('admin/addpostagens', {
            erros: erros,
            categorias: categorias
        })
    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg", "erro ao carregar categorias")
        res.redirect("/admin/postagens")
    })
        
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
        new Postagens(novaPostagem).save().then(()=>{
            req.flash("success_msg", "postagem criada com sucesso")
            res.redirect('/admin/postagens')
        }).catch((err)=>{
            req.flash("error_msg", "houve um erro ao salvar a postagem")
            res.redirect('/admin/postagens')
        })
        
    }
})

router.get('/postagens/edit/:id', eAdmin, (req, res)=>{

    Postagens.findOne({_id: req.params.id}).lean().then((postagens)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render('admin/editpostagens', {
                categorias: categorias,
                postagens: postagens
            })

        }).catch((err)=>{
            req.flash("error_msg", "erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })
    }).catch((err)=>{
        req.flash("error_msg", "erro ao carregar categorias")
        res.redirect("/admin/postagens")
    })
})

router.post('/postagens/edit', eAdmin, (req, res)=>{
    Postagens.findOne({_id: req.body.id}).then((postagens)=>{
        console.log("Id recebido: ", req.body.id)

        postagens.titulo = req.body.titulo
        postagens.slug = req.body.slug
        postagens.descricao = req.body.descricao
        postagens.conteudo = req.body.conteudo
        postagens.categoria = req.body.categoria

        postagens.save().then(()=>{
            req.flash("success_msg", "postagem editada com sucesso")
            res.redirect('/admin/postagens')
        }).catch((err)=>{
            req.flash("error_msg", "erro interno!")
            res.redirect("/admin/postagens")
        })

    }).catch((err)=>{
        req.flash("error_msg", "erro ao salvar edição de postagens")
        res.redirect("/admin/postagens")
    })
})

router.get('/postagens/deletar/:id', eAdmin, (req, res)=>{
    Postagens.findByIdAndDelete({_id: req.params.id}).then(()=>{
        req.flash("success_msg", "postagem Deletada com sucesso")
        res.redirect('/admin/postagens')    
    }).catch((err)=>{
        req.flash("error_msg", "erro ao deletar postagem")
        res.redirect("/admin/postagens")
    })
})

module.exports = router