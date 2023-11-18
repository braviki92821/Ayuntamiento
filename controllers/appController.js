import { validationResult } from "express-validator";
import { Solicitud } from "../models/index.js"
import { formatearFecha} from "../helpers/index.js"

const inicio = (req, res) => {

    res.render('usuario/inicio',{
        pagina: 'Inicio',
        csrfToken: req.csrfToken(),
    })
}

const perfil = (req, res) => {
    res.render('usuario/perfil',{
        pagina: 'Perfil',
    })
}

const crearSolicitud = (req, res) => {
    res.render('usuario/crear-solicitud',{
        pagina: 'Crear Solicitud',
        csrfToken: req.csrfToken(),
        datos:{}
    })
}

const enviarSolicitud = async (req,res) => {
    let resultado = validationResult(req);

    if(!resultado.isEmpty()){
       return res.render('usuario/crear-solicitud',{
            pagina: 'Crear Solicitud',
            csrfToken: req.csrfToken(),
            datos: req.body,
            errores: resultado.array()
        })
    }

    const { titulo, tipoRecurso, pedido:Pedido } = req.body
    const { id:usuarioId, departamentoId } =req.usuario
    
    try{
        await Solicitud.create({
            titulo,
            tipoRecurso,
            Pedido,
            departamentoId,
            usuarioId
        })

        res.redirect('/user/inicio')
    }catch(error){
        console.log(error)
    }
}

const verSolicitudes = async (req, res) => {

     const { id } = req.usuario

     const solicitudes = await Solicitud.findAll({
        where: { usuarioId: id},
        order: [[ 'createdAt','DESC' ]]
    })
//    console.log(noHTML('<p>Monitor de 24" pulgadas para la sala de conferencias</p>'))

    res.render('usuario/solicitudes',{
        pagina: 'Mis Solicitudes',
        solicitudes,
        csrfToken: req.csrfToken(),
        formatearFecha
    })
}

export {
    inicio,
    perfil,
    crearSolicitud,
    enviarSolicitud,
    verSolicitudes
}