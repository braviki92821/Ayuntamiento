import express from 'express'
import { autenticar, cerrarSesion, formularioLogin, confirmar } from '../controllers/usuarioController.js'
import protegerRuta from '../middleware/protegerRuta.js'


const router = express.Router()

router.get('/login', formularioLogin)
router.post('/login',autenticar)

router.get('/confirmar/:token', confirmar)

// router.get('/reset-password', )

router.post('/cerrar-sesion', cerrarSesion)

export default router