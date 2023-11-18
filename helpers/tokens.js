import jwt from 'jsonwebtoken'

const generarId = () => Date.now() + Math.random().toString(32).substring(2)

const generarPassword = () => Math.random().toString(36).substring(2)

const generarJWT = datos => jwt.sign({
        id: datos.id,
        nombre: datos.nombre,
        tipo: datos.tipo
       },process.env.JWT_SECRET,{
         expiresIn:'1d'
})

export {
    generarId,
    generarJWT,
    generarPassword
}