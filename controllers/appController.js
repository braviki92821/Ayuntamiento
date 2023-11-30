import { validationResult } from "express-validator";
import { Solicitud, Usuario, Aviso } from "../models/index.js"
import { formatearFecha} from "../helpers/index.js"

const inicio = async (req, res) => {

    const { id } = req.usuario

    const [avisos, avisosG] = await Promise.all([
        Aviso.findAll({ limit: 2, where: { destino: id, estado: true }}),
        Aviso.findAll({ limit: 4, where: { destino: 'todos', estado:true }})
    ])

    res.render('usuario/inicio',{
        pagina: 'Inicio',
        csrfToken: req.csrfToken(),
        avisos,
        avisosG,
        formatearFecha,
    })
}

const perfil = async (req, res) => {

    const { id } = req.usuario

    const usuario = await Usuario.scope('eliminarPassword').findByPk(id)

    res.render('usuario/perfil',{
        pagina: 'Perfil',
        csrfToken: req.csrfToken(),
        usuario
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
            estado: true,
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

     const { pagina: paginaActual } = req.query;

     const exp = /^[0-9]+$/;

     if (!exp.test(paginaActual)) {
        return res.redirect("/user/mis-solicitudes?pagina=1");
     }

     let limite = 6;
    
     const offset = paginaActual * limite - limite;

     const [solicitudes, total] = await Promise.all([
        Solicitud.findAll({
            limit: limite,
            offset,
            where: { usuarioId: id },
            order: [[ 'createdAt','DESC' ]]
         }),
        Solicitud.count({where: { usuarioId: id } })
     ])

//    console.log(noHTML('<p>Monitor de 24" pulgadas para la sala de conferencias</p>'))

    res.render('usuario/solicitudes',{
        pagina: 'Mis Solicitudes',
        solicitudes,
        csrfToken: req.csrfToken(),
        formatearFecha,
        limite,
        offset,
        paginaActual:Number(paginaActual),
        paginas: Math.ceil(total / limite),
        total
    })
}

const mensajesPendientes = async (req, res) => {
    const { id } = req.usuario

    const mensajes = await Aviso.findAll({ where: { destino: id, estado: true }, include: [ { model: Usuario.scope('eliminarPassword'), as: 'usuario'}] })

    res.render('usuario/mensajes-pendientes', {
        pagina: 'No leidos',
        csrfToken: req.csrfToken(),
        formatearFecha,
        mensajes
    })
}
 
const mensajes = async (req, res) => {
    const { id } = req.usuario

    const mensajes = await Aviso.findAll({ where: { destino: id }, include: [ { model: Usuario.scope('eliminarPassword'), as: 'usuario'}] })

    res.render('usuario/mensajes', {
        pagina: 'Todos',
        csrfToken: req.csrfToken(),
        formatearFecha,
        mensajes
    })
}

const mensajeLeido = async( req, res) => {
    const { id } = req.params
    const { pagina } = req.body
    const mensaje = await Aviso.findByPk(id)

    try {
        mensaje.set({
            estado: false
        })

        await mensaje.save()

        res.redirect(pagina);
        
    } catch (error) {
        console.log(error)
    }

}

export {
    inicio,
    mensajeLeido,
    perfil,
    crearSolicitud,
    enviarSolicitud,
    verSolicitudes,
    mensajesPendientes,
    mensajes
}