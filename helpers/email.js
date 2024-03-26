import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

export const emailRegistro = async (datos) => {
  const { email, nombre, token } = datos

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  //INFORMACION DEL EMAIL
  const info = await transport.sendMail({
    from: '"UpTask - Administrado de Proyectos" <cuentas@uptask.com>',
    to: email,
    subject: "UpTask - Confirma Tu Cuenta",
    text: "Comprueba tu Cuenta en UpTask",
    html: `
            <p>Hola: ${nombre} Comprueba tu Cuenta en UpTask</p>
            <p>Tu Cuenta ya está casi lista, solo debes comprobarla en el siguiente enlace:</p>
            <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta</a>
            <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
        `
  })
}


export const emailOlvidePassword = async (datos) => {
  const { email, nombre, token } = datos

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_POST,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  //INFORMACION DEL EMAIL
  const info = await transport.sendMail({
    from: '"UpTask - Administrado de Proyectos" <cuentas@uptask.com>',
    to: email,
    subject: "UpTask - Reestablece tu Password",
    text: "Reestablece tu Password",
    html: `
            <p>Hola: ${nombre} Has Solicitado Reestablecer tu Password</p>
            <p>Sigue el siguiente para generar un nuevo password:</p>
            <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password</a>
            <p>Si tu no solicitaste este email, puedes ignorar el mensaje</p>
        `
  })
}