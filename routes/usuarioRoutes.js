import express from 'express'
import { autenticar, cerrarSesion, formularioLogin, confirmar } from '../controllers/usuarioController.js'


const router = express.Router()

router.get('/login',formularioLogin)
router.post('/login',autenticar)

router.get('/confirmar/:token',confirmar)

router.post('/cerrar-sesion', cerrarSesion)

export default router