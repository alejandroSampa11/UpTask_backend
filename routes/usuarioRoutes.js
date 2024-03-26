import express from "express";
const router = express.Router();
import {registrar, autenticar, confirmar, olvidePassword,comprobarToken, nuevoPassword, perfil} from '../controllers/usuarioController.js'
import checkAuth from "../middleware/checkAuth.js";

//AUTENTICACION, REGISTRO Y CONFIRMACION DE USUARIOS
router.post('/', registrar); //CREAR NUEVO USUARIO 
router.post('/login', autenticar) // AUTENTICAR USUARIO
router.get('/confirmar/:token', confirmar) // AUTENTICAR USUARIO
router.post('/olvide-password', olvidePassword) //OLVIDE PASSWORD
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword)//NUEVO PASSWORD
router.get('/perfil', checkAuth, perfil)




export default router;