import express from 'express'
import protegerRuta from '../middleware/protegerRuta.js'
import { body } from 'express-validator'
import { categoria, inicio, perfil, solicitudes, cambiarEstado, enviarRespuesta, formularioRegistro, registrarUsuario, usuarios } from '../controllers/adminController.js'

const router = express.Router()

router.get('/inicio', protegerRuta, inicio)

router.get('/perfil', protegerRuta, perfil)

router.get('/solicitudes', protegerRuta, solicitudes)

router.get('/categoria/:id', protegerRuta,categoria)

router.get('/solicitud-status/:id', protegerRuta, cambiarEstado)
router.post('/solicitud-status/:id', protegerRuta, body('observaciones').notEmpty().withMessage('Debe enviar un mensaje'), enviarRespuesta)

router.get('/nuevo-usuario', protegerRuta, formularioRegistro)
router.post('/nuevo-usuario', protegerRuta, body("nombre").notEmpty().withMessage("No se permiten valores vacios"),
                                            body("apellido").notEmpty().withMessage("No se permiten valores vacios"),
                                            body("correo").isEmail().notEmpty().withMessage("correo no invalido"),
                                            body("cargo").notEmpty().withMessage("No se permiten valores vacios"),
                                            body("tipo").notEmpty().withMessage("Seleccione un tipo de usuario"),
                                            body("departamento").notEmpty().withMessage("Seleccione un departamento"),
                                            registrarUsuario)
router.get('/usuarios', protegerRuta, usuarios)

export default router