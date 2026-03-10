if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://brennobnsvh_db_user:brennodelucas@brenno.lvhfypc.mongodb.net/blogapp?appName=Brenno"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}