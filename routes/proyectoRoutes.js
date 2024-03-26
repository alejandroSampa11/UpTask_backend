import {
    obtenerProyecto,
    nuevosProyecto,
    obtenerProyectos,
    editarProyecto,
    eliminarColaborador,
    eliminarProyecto,
    agregarColaborador,
    buscarColaborador
} from '../controllers/proyectoController.js'
import checkAuth from '../middleware/checkAuth.js'
import express from 'express'

const router = express.Router()

router.route('/').get(checkAuth, obtenerProyectos).post(checkAuth, nuevosProyecto)
router.route('/:id')
    .get(checkAuth, obtenerProyecto)
    .put(checkAuth, editarProyecto)
    .delete(checkAuth, eliminarProyecto)
router.post('/colaboradores', checkAuth, buscarColaborador)
router.post('/colaboradores/:id', checkAuth, agregarColaborador)
router.post('/eliminar-colaborador/:id', checkAuth, eliminarColaborador)

export default router