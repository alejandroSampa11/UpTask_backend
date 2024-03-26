import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/email.js";

const registrar = async (req, res) => {
    //EVITAR REGISTRAR DUPLICADOS
    const { email } = req.body
    const existeUsuario = await Usuario.findOne({ email: email })
    if (existeUsuario) {
        const error = new Error('Usuario ya registrado')
        return res.status(404).json({ msg: error.message })
    }
    try {
        const usuario = new Usuario(req.body)
        usuario.token = generarId()
        await usuario.save()
        
        //ENVIAR EL EMAIL DE CONFIRMACION
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })


        res.json({msg: 'Usuario Creado Correctamente, Revisa tu Email para Confirmar tu Cuenta'})
    } catch (error) {
        console.log(error)
    }
};

const autenticar = async (req, res) => {

    const { email, password } = req.body

    //COMPROBAR SI EL USUARIO EXISTE
    const usuario = await Usuario.findOne({ email: email })
    if (!usuario) {
        const error = new Error('El Usuario No Existe')
        return res.status(404).json({ msg: error.message })
    }

    //COMPROBAR SI EL USUARIO ESTA CONFIRMADO
    if (!usuario.confirmado) {
        const error = new Error('Tu Cuenta No Ha Sido Confirmada')
        return res.status(404).json({ msg: error.message })
    }

    //COMPROBAR EL PASSWORD
    if (await usuario.comprobarPassword(password)) {
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id)
        })
    } else {
        const error = new Error('El Password es Incorrecto')
        return res.status(404).json({ msg: error.message })
    }

}

const confirmar = async (req, res) => {
    const { token } = req.params
    const usuarioConfirmar = await Usuario.findOne({ token: token })
    if (!usuarioConfirmar) {
        const error = new Error('Token No Válido')
        return res.status(404).json({ msg: error.message })
    }
    try {
        usuarioConfirmar.confirmado = true
        usuarioConfirmar.token = ""
        await usuarioConfirmar.save()
        res.json({
            msg: 'Usuario Confirmado Correctamente'
        })
    } catch (error) {
        console.log(error)
    }
    //ugbd09i6pa81hje6qv3g
}

const olvidePassword = async (req, res) => {
    const { email } = req.body
    const usuario = await Usuario.findOne({ email: email })
    if (!usuario) {
        const error = new Error('El Usuario No Existe')
        return res.status(404).json({ msg: error.message })
    }
    try {
        usuario.token = generarId()
        await usuario.save()

        //ENVIAR EMAIL
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        res.json({
            msg: "Hemos Enviado un Email con las Instrucciones"
        })
    } catch (error) {
        console.log(error)
    }

}

const comprobarToken = async (req, res) => {
    const { token } = req.params
    const tokenValido = await Usuario.findOne({ token: token })
    if (tokenValido) {
        res.json({
            msg: 'Token Válido y El Usuario Existe'
        })
    } else {
        const error = new Error('Token No Válido')
        return res.status(404).json({ msg: error.message })
    }

}

const nuevoPassword = async (req, res) => {
    const { token } = req.params
    const { password } = req.body
    const usuario = await Usuario.findOne({ token: token })
    if (usuario) {
        usuario.password = password
        usuario.token = ""
        try {
            await usuario.save()
            res.json({
                msg: "Password Modificado Correctamente"
            })
        } catch (error) {
            console.log(error)
        }
    } else {
        const error = new Error('Token No Válido')
        return res.status(404).json({ msg: error.message })
    }
}

const perfil = async (req, res) => {
    const { usuario } = req
    res.json(usuario)
}

export { registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil };