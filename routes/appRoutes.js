import express from 'express'
import { crearSolicitud, enviarSolicitud, inicio, perfil, verSolicitudes } from '../controllers/appController.js'
import { mensajeLeido, mensajesPendientes, mensajes } from '../controllers/appController.js'
import { body } from 'express-validator'
import protegerRuta from '../middleware/protegerRuta.js'
const router = express.Router()

router.get('/inicio', protegerRuta, inicio)

router.get('/perfil', protegerRuta, perfil)

router.get('/crear-solicitud', protegerRuta, crearSolicitud)
router.post('/crear-solicitud', protegerRuta, body('titulo').notEmpty().withMessage('Debe agregar un titulo a su solicitud'),
                                body('tipoRecurso').notEmpty().withMessage('Seleccione el tipo de recurso a solicitar'),
                                body('pedido').notEmpty().withMessage('Debe describir los recursos a solicitar'),
                                enviarSolicitud)

router.get('/mis-solicitudes', protegerRuta, verSolicitudes)

router.get('/mensajes-pendientes', protegerRuta, mensajesPendientes)

router.get('/mensajes', protegerRuta, mensajes)

router.post('/mensaje-leido/:id', protegerRuta, mensajeLeido)


export default router