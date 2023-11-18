import express from 'express'
import csrf from 'csurf'
import cookieParser from 'cookie-parser'
import db from './config/db.js'
import usuarioRoutes from './routes/usuarioRoutes.js'
import appRoutes from './routes/appRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

const app = express()

app.use( express.urlencoded({extended:true}), express.json())

const port = process.env.PORT || 4500

app.use( cookieParser() )

app.use( csrf({cookie:true}))

try{
    await db.authenticate();
    db.sync()
    console.log('Conectado a mysql')
}catch(error){
     console.log(error)
}


app.use('/admin',adminRoutes)
app.use('/user',appRoutes)
app.use('/auth', usuarioRoutes)

app.set('view engine', 'pug')
app.set('views', './views')

app.use(express.static('public'))

app.listen(port, ()=>{
    console.log('El servidor esta en el puerto '+ port)
})