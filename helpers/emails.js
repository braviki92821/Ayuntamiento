import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config({path:'.env'})

const emailRegistro = async(datos) =>{
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        //secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const { email, password, nombre, token } = datos

      await transport.sendMail({
        from: 'Ayutamiento de Papantla',
        to: email,
        subject: 'Confirma tu cuenta',
        text:'Confirma tu cuenta',
        html: 
        `<p>Hola ${nombre}, compruebe su cuenta en Ayuntamiento de papantla</p>
         <p>Tu contraseña de acceso: ${password} asegurate de no compartir tu contraseña y guardarla en un lugar seguro</p>
         <p>Tu cuenta en ayuntamiento de papantla ya esta lista, solo debes confirmarla en
         el siguiente enlace <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 4500}/auth/confirmar/${token}">Confirmar Cuenta</a></p>
        `
      })
}

const emailOlvidePassword = async(datos) =>{
  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      //secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const { email, nombre, token } = datos

    await transport.sendMail({
      from: 'Ayutamiento de Papantla',
      to: email,
      subject: 'Restablecer tu contraseña',
      text:'Restablecer tu contraseña',
      html: 
      `<p>Hola ${nombre}, has solicitado reestablecer tu password en Ayuntamiento de papantla</p>
       <p>Sigue el siguiente enlace <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 4500}/auth/olvide-password/${token}">Reestablecer password</a></p>
       <p>Si no solicitaste el cambio ignora el mensaje</p>`
    })
}

const emailAviso = async(datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    //secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  const { email, nombre, apellido, titulo, estatus, observaciones } = datos
  
  await transport.sendMail({
    from: 'Ayutamiento de Papantla',
    to: email,
    subject: 'Solicitud de Recurso',
    text:'Solicitud de Recurso',
    html: 
    `<p>Hola ${nombre} ${apellido}, su solicitud: ${titulo} ha sido ${estatus}</p>
     <p>${observaciones}</p>
     <p>Tenga un excelente dia Atte: Ayuntamiento de Papantla</p>`
  })
}

export {
    emailRegistro,
    emailOlvidePassword,
    emailAviso
}