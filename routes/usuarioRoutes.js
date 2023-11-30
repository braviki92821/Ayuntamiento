import express from 'express'
import { autenticar, cerrarSesion, formularioLogin, confirmar, resetPassword } from '../controllers/usuarioController.js'
import protegerRuta from '../middleware/protegerRuta.js'


const router = express.Router()

router.get('/login', formularioLogin)
router.post('/login',autenticar)

router.get('/confirmar/:token', confirmar)

router.get('/reset-password', protegerRuta, resetPassword)

router.post('/cerrar-sesion', cerrarSesion)

export default router