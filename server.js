const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app.js');

dotenv.config({path:'./config.env'});


const DB = process.env.DATABASE.replace('<password>',process.env.DATABASE_PASSWORD);
try{
  mongoose
    .connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('db connection succes');
    });

}catch(err){
  console.log(`err:${err}`);
}


const port = 3000
const server = app.listen(port,()=>{
    console.log(`app is listening to port ${port}`);
})

process.on('unhandledRejection',err => {
  console.log(err.name,err.message);
  process.exit(1);
})
