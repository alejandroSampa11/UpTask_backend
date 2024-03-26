import Proyecto from "../models/Proyecto.js"
import mongoose from "mongoose"
import Tarea from "../models/Tarea.js"

const agregarTarea = async (req, res) => {
    console.log(req.body)
    const { proyecto } = req.body
    const valid = mongoose.Types.ObjectId.isValid(proyecto)
    if (!valid) {
        const error = new Error('Proyecto No Encontrado')
        return res.status(404).json({ msg: error.message })
    }
    const existeProyecto = await Proyecto.findById(proyecto.trim())
    if (!existeProyecto) {
        const error = new Error('El Proyecto No Existe')
        return res.status(404).json({
            msg: error.message
        })
    }
    if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('No Tienes los Permisos para Añadir Tareas')
        return res.status(403).json({
            msg: error.message
        })
    }
    try {
        const tareaAlmacenada = await Tarea.create(req.body)
        //ALMACENAR EL ID EN EL PROYECTO
        existeProyecto.tareas.push(tareaAlmacenada._id)
        await existeProyecto.save()
        return res.json(tareaAlmacenada)

    } catch (error) {
        console.log(error)
    }

}

const obtenerTarea = async (req, res) => {
    const { id } = req.params
    const valid = mongoose.Types.ObjectId.isValid(id)
    if (!valid) {
        const error = new Error('Tarea No Válido')
        return res.status(404).json({ msg: error.message })
    }
    const existeTarea = await Tarea.findById(id.trim()).populate('proyecto')
    if (!existeTarea) {
        const error = new Error('Tarea No Encontrada')
        return res.status(404).json({ msg: error.message })
    }
    if (existeTarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción No Permitida')
        return res.status(403).json({
            msg: error.message
        })
    }
    res.json(existeTarea)
}

const actualizarTarea = async (req, res) => {
    const { id } = req.params
    const valid = mongoose.Types.ObjectId.isValid(id)
    if (!valid) {
        const error = new Error('Tarea No Válido')
        return res.status(404).json({ msg: error.message })
    }
    const tarea = await Tarea.findById(id.trim()).populate('proyecto')
    if (!tarea) {
        const error = new Error('Tarea No Encontrada')
        return res.status(404).json({ msg: error.message })
    }
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción No Permitida')
        return res.status(403).json({
            msg: error.message
        })
    }
    tarea.nombre = req.body.nombre || tarea.nombre
    tarea.descripcion = req.body.descripcion || tarea.descripcion
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega
    tarea.prioridad = req.body.prioridad || tarea.prioridad

    try {
        const tareaAlmacenada = await tarea.save()
        res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    }
}

const eliminarTarea = async (req, res) => {
    const {id} = req.params
    const valid = mongoose.Types.ObjectId.isValid(id)
    if (!valid) {
        const error = new Error('Tarea No Válido')
        return res.status(404).json({ msg: error.message })
    }
    const tarea = await Tarea.findById(id.trim()).populate('proyecto')
    if (!tarea) {
        const error = new Error('Tarea No Encontrada')
        return res.status(404).json({ msg: error.message })
    }
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción No Permitida')
        return res.status(403).json({
            msg: error.message
        })
    }
    try {
        const proyecto = await Proyecto.findById(tarea.proyecto)
        proyecto.tareas.pull(tarea._id)
        await Promise.allSettled([ await proyecto.save(), await tarea.deleteOne()])
        res.json({
            msg: 'La Tarea Fue Eliminada'
        })
    } catch (error) {
        console.log(error)
    }
}

const cambiarEstado = async (req, res) => {
    const {id} = req.params
    const valid = mongoose.Types.ObjectId.isValid(id)
    if (!valid) {
        const error = new Error('Tarea No Válido')
        return res.status(404).json({ msg: error.message })
    }
    const tarea = await Tarea.findById(id.trim()).populate('proyecto')
    if (!tarea) {
        const error = new Error('Tarea No Encontrada')
        return res.status(404).json({ msg: error.message })
    }
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some((colaborador) => colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error('Acción No Permitida')
        return res.status(403).json({
            msg: error.message
        })
    }
    tarea.estado = !tarea.estado
    tarea.completado = req.usuario._id
    await tarea.save()
    const tareaAlmacenada = await Tarea.findById(id.trim()).populate('proyecto').populate('completado')
    res.json(tareaAlmacenada)
}

export {
    agregarTarea, obtenerTarea, actualizarTarea, eliminarTarea, cambiarEstado
}




