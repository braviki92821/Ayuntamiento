import { validationResult } from "express-validator";
import { Op } from 'sequelize';
import { Solicitud, Departamento, Usuario, Aviso } from "../models/index.js"
import { formatearFecha } from "../helpers/index.js"
import { emailAviso, emailRegistro } from "../helpers/emails.js"
import { generarId, generarPassword } from "../helpers/tokens.js"

const inicio = (req,res) => {

    const { tipo } = req.usuario

    if(tipo != 'Administrador'){
        res.redirect('/user/inicio')
    }

    res.render('admin/inicio', {
        pagina: 'Inicio',
        csrfToken: req.csrfToken(),
    })
}

const perfil = async (req, res) => {

    const { id, tipo } = req.usuario

    if(tipo != 'Administrador'){
        res.redirect('/user/inicio')
    }

    const usuario = await Usuario.scope('eliminarPassword').findByPk(id)

    res.render('admin/perfil',{
        pagina: 'Perfil',
        csrfToken: req.csrfToken(),
        usuario
    })
}

const solicitudes = async (req, res) => {

    const { tipo } = req.usuario

    if(tipo != 'Administrador'){
        res.redirect('/user/inicio')
    }

    const Contabilidad = await Solicitud.count({ where: { estatus: null , departamentoId: 1 } })
    const Recursos = await Solicitud.count({ where: { estatus: null , departamentoId: 2 } })
    const Comunicacion = await Solicitud.count({ where: { estatus: null , departamentoId: 3 } })
    const Administracion = await Solicitud.count({ where: { estatus: null , departamentoId: 4 } })
    const Turismo = await Solicitud.count({ where: { estatus: null , departamentoId: 5 } })

    res.render('admin/solicitudes', {
        pagina: 'Solicitudes',
        csrfToken: req.csrfToken(),
        Contabilidad,
        Recursos,
        Comunicacion,
        Administracion,
        Turismo
    })
}

const categoria = async (req, res) => {

    const { tipo } = req.usuario

    if(tipo != 'Administrador'){
        res.redirect('/user/inicio')
    }
       
    const { id } = req.params;

    const categoria = await Departamento.findByPk(id) 

    const solicitudes = await Solicitud.findAll({
        where: { departamentoId:id, estatus: null  },
        include: [
            { model: Usuario.scope('eliminarPassword'), as:'usuario' }
        ]
    })

    res.render('admin/categoria', {
        pagina: 'Categoria',
        solicitudes,
        categoria,
        csrfToken: req.csrfToken(),
        formatearFecha
    })
    
}

const cambiarEstado = async (req, res) => {
    
    const { tipo } = req.usuario

    if(tipo != 'Administrador'){
        res.redirect('/user/inicio')
    }
    
    const { id } = req.params

    const solicitud = await Solicitud.findByPk(id,{
        include: [
            { model: Usuario.scope('eliminarPassword'), as:'usuario' }
        ]
    })

    if(!solicitud){
        return res.redirect('/admin/solicitudes')
    }

    res.render('admin/detalle-solicitud', {
        pagina:'Detalle de solicitud',
        csrfToken: req.csrfToken(),
        solicitud
    })
}

const enviarRespuesta = async (req, res) => {
    let resultado = validationResult(req);

    const { tipo} = req.usuario

    if(!resultado.isEmpty()){
        return res.render('admin/detalle-solicitud',{
             pagina: 'Detalle de solicitud',
             csrfToken: req.csrfToken(),
             datos: req.body,
             errores: resultado.array()
         })
    }

    if(tipo != 'Administrador'){
        res.redirect('/user/inicio')
    }
    
    const { id } = req.params

    const solicitud = await Solicitud.findByPk(id,{
        include: [
            { model: Usuario.scope('eliminarPassword'), as:'usuario' }
        ]
    })

    if(!solicitud){
        return res.redirect('/admin/solicitudes')
    }

    const { observaciones, estatus } = req.body


    try {

        solicitud.set({
            estatus: Boolean(Number(estatus)),
            observaciones
        })

        await emailAviso({
            nombre: solicitud.usuario.nombre,
            apellido: solicitud.usuario.apellido,
            email: solicitud.usuario.correo,
            titulo: solicitud.titulo,
            observaciones: observaciones,
            estatus: Boolean(Number(estatus)) ? 'Aceptada' : 'Rechazada'
        })
        
        await Aviso.create({
            titulo: 'Estado de solicitud',
            mensaje: `Solicitud con titulo: ${solicitud.titulo} ha sido ${Boolean(Number(estatus)) ? 'Aceptada' : 'Rechazada'}`,
            estado: true,
            destino: solicitud.usuario.id,
            usuarioId: req.usuario.id
        })

        await solicitud.save()

        res.redirect('/admin/solicitudes')

    } catch (error) {
        console.log(error)
    }


}

const formularioRegistro = async (req, res) => {

    const { tipo } = req.usuario

    if(tipo != 'Administrador'){
        res.redirect('/user/inicio')
    }
    
    const departamentos = await Departamento.findAll()

    res.render("auth/crear-usuario", {
      pagina: "Registrar Nuevo Usuario",
      departamentos,
      csrfToken: req.csrfToken(),
      datos: {}
    });
};
  
const registrarUsuario = async (req, res) => {

  let resultado = validationResult(req);

  const { tipo } = req.usuario

  if(tipo != 'Administrador'){
      res.redirect('/user/inicio')
  }

  const departamentos = await Departamento.findAll()

  if (!resultado.isEmpty()) {
    return res.render("auth/crear-usuario", {
      pagina: "Registrar Nuevo Usuario",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
      datos: req.body,
      departamentos
    });
  }

  const { nombre, apellido, correo, cargo, tipo:tipou, departamento:departamentoId } = req.body;

  const existeUsuario = await Usuario.findOne({ where: { correo } });
  
  if (existeUsuario) {
    return res.render("auth/crear-usuario", {
      pagina: "Añadir nuevo usuario",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "Este correo ya esta registrado" }],
      datos: req.body,
      departamentos
    });
  }

  const password = generarPassword()   
  console.log(password)
  const usuario = await Usuario.create({
    nombre,
    apellido,
    correo,
    cargo,
    password,
    token: generarId(),
    estado: true,
    tipo: tipou,
    departamentoId
  });
  
  await emailRegistro({
    nombre: usuario.nombre + ' ' +usuario.apellido,
    password: password,
    email: usuario.correo,
    token: usuario.token,
  });
  
  res.redirect('/admin/usuarios')
};

const usuarios = async (req, res) => {
    const { id, tipo } = req.usuario

    if(tipo != 'Administrador'){
        res.redirect('/user/inicio')
    }

    const usuarios = await Usuario.scope('eliminarPassword').findAll({
        where: { id: { [Op.ne]: id  }, estado: true },
        include: [ { model: Departamento, as: 'departamento'}]
    })

    res.render('admin/usuarios', {
        pagina: 'Usuarios',
        csrfToken: req.csrfToken(),
        usuarios
    })
}

const editarUsuario = async (req ,res) => {
    const { id } = req.params
    const { tipo } = req.usuario

    if(tipo != 'Administrador'){
        res.redirect('/user/inicio')
    }

    const usuario = await Usuario.scope('eliminarPassword').findByPk(id,{
        include: [ { model: Departamento, as: 'departamento'}]
    })
    const departamentos = await Departamento.findAll()

    if(!usuario){
        return res.redirect('/admin/usuarios')
    }

    res.render('auth/editar-usuario',{
        pagina: 'Editar usuario',
        csrfToken: req.csrfToken(),
        usuario,
        departamentos
    })
}

const guardarUsuario = async (req, res) => {
    let resultado = validationResult(req);
    const { id } = req.params
    const { tipo } = req.usuario

    if(tipo != 'Administrador'){
        res.redirect('/user/inicio')
    }

    const usuario = await Usuario.scope('eliminarPassword').findByPk(id,{
        include: [ { model: Departamento, as: 'departamento'}]
    })

    const departamentos = await Departamento.findAll()

    if(!usuario){
        return res.redirect('/admin/usuarios')
    }

    if (!resultado.isEmpty()) {
        return res.render("auth/editar-usuario", {
          pagina: "Editar Usuario",
          csrfToken: req.csrfToken(),
          errores: resultado.array(),
          usuario,
          datos: req.body,
          departamentos
        });
    }
    
    try {
        const { nombre, apellido, correo, cargo, tipo:tipou, departamento:departamentoId } = req.body;
        usuario.set({
            nombre,
            apellido,
            correo,
            cargo,
            tipo: tipou,
            departamentoId
        })

        await usuario.save()

        res.redirect('/admin/usuarios')
    } catch (error) {
        console.log(error)
    }
    
}

const eliminarUsuario = async (req, res) => {
    const { id } = req.params
    const { tipo } = req.usuario

    if(tipo != 'Administrador'){
        res.redirect('/user/inicio')
    }

    const usuario = await Usuario.scope('eliminarPassword').findByPk(id)

    if(!usuario) {
        return res.redirect('/admin/usuarios')
    }

    try {
       usuario.set({
         estado: false
       })

       await usuario.save()

       res.redirect('/admin/usuarios')
    } catch (error) {
        console.log(error)
    }
}

const crearAviso = async (req, res) => {
    const { id, tipo } = req.usuario

    if(tipo != 'Administrador'){
        res.redirect('/user/inicio')
    }

    const usuarios = await Usuario.scope('eliminarPassword').findAll({
        where: { id: { [Op.ne]: id  }, estado: true }
    })

    res.render('admin/crear-aviso', {
        pagina: 'Crear Aviso',
        csrfToken: req.csrfToken(),
        usuarios,
        datos: {}
    })
}

const enviarAviso = async (req, res) => {
    let resultado = validationResult(req)

    const { id, tipo } = req.usuario

    if(tipo != 'Administrador'){
        res.redirect('/user/inicio')
    }

    const usuarios = await Usuario.scope('eliminarPassword').findAll({
        where: { id: { [Op.ne]: id  }, estado: true }
    })

    if(!resultado.isEmpty()){
        return res.render('admin/crear-aviso', {
            pagina: 'Crear Aviso',
            csrfToken: req.csrfToken(),
            usuarios,
            datos: req.body,
            errores: resultado.array()
        })
    }

    const  { titulo, mensaje, destino } = req.body

    await Aviso.create({
        titulo,
        mensaje,
        destino,
        estado: true,
        usuarioId: id
    })

    res.redirect('/admin/inicio')
}

const avisos = async (req, res) => {
    const { tipo } = req.usuario

    if(tipo != 'Administrador'){
        res.redirect('/user/inicio')
    }

    const avisos = await Aviso.findAll({ where: { estado: true, destino: 'todos'}})

    res.render('admin/lista-avisos',{
        pagina: 'Todos los avisos',
        csrfToken: req.csrfToken(),
        formatearFecha,
        avisos
    })
}

const eliminarAviso = async (req, res) => {
    const { tipo } = req.usuario
    const { id } = req.params

    if(tipo != 'Administrador'){
        res.redirect('/user/inicio')
    }

    const aviso = await Aviso.findByPk(id)
    
    if(!aviso) {
        return res.redirect('/admin/lista-avisos')
    }

    try {
        aviso.set({
          estado: false
        })
 
       await aviso.save()
 
        res.redirect('/admin/lista-avisos')
     } catch (error) {
         console.log(error)
     }
}

export {
    inicio,
    perfil,
    solicitudes,
    categoria,
    cambiarEstado,
    enviarRespuesta,
    formularioRegistro,
    registrarUsuario,
    usuarios,
    editarUsuario,
    guardarUsuario,
    eliminarUsuario,
    crearAviso,
    enviarAviso,
    avisos,
    eliminarAviso
}