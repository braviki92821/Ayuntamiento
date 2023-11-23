import { validationResult } from "express-validator";
import { Op } from 'sequelize';
import { Solicitud, Departamento, Usuario } from "../models/index.js"
import { formatearFecha } from "../helpers/index.js"
import { emailAviso, emailRegistro } from "../helpers/emails.js"
import { generarId, generarPassword } from "../helpers/tokens.js"
import bcrypt from 'bcrypt'

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

        const correo = await emailAviso({
            nombre: solicitud.usuario.nombre,
            apellido: solicitud.usuario.apellido,
            email: solicitud.usuario.correo,
            titulo: solicitud.titulo,
            observaciones: observaciones,
            estatus: Boolean(Number(estatus)) ? 'Aceptada' : 'Rechazada'
        })
        console.log(correo)
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

  const { tipou } = req.usuario

  if(tipou != 'Administrador'){
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

  const { nombre, apellido, correo, cargo, tipo, departamento:departamentoId } = req.body;

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

  const usuario = await Usuario.create({
    nombre,
    apellido,
    correo,
    cargo,
    password: bcrypt.hashSync( password, 10 ),
    token: generarId(),
    tipo: tipo,
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
        where: { id: { [Op.ne]: id  } }
    })

    res.render('admin/usuarios', {
        pagina: 'Usuarios',
        csrfToken: req.csrfToken(),
        usuarios
    })
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
    usuarios
}