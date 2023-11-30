import express from 'express'
import { body } from "express-validator";
import { autenticar, cerrarSesion, formularioLogin, confirmar, resetPassword, formularioOlvidePassword, comprobarToken, nuevoPassword, nuevoPasswordAuth, cambiarPassword } from '../controllers/usuarioController.js'
import protegerRuta from '../middleware/protegerRuta.js'


const router = express.Router()

router.get('/login', formularioLogin)
router.post('/login',autenticar)

router.get('/confirmar/:token', confirmar)

router.get('/olvide-password',formularioOlvidePassword)
router.post('/olvide-password',resetPassword)

router.get('/olvide-password/:token', comprobarToken)
router.post('/olvide-password/:token', nuevoPassword)

router.get('/reset-password', protegerRuta, nuevoPasswordAuth)
router.post('/reset-password', protegerRuta, cambiarPassword)

router.post('/cerrar-sesion', cerrarSesion)

export default router