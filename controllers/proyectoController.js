import Proyecto from "../models/Proyecto.js"
import Usuario from "../models/Usuario.js"
import mongoose from "mongoose"

const obtenerProyectos = async (req, res) => {
    const proyectos = await Proyecto.find({
        '$or': [
            { 'colaboradores': { $in: req.usuario } },
            { 'creador': { $in: req.usuario } },
        ]
    }).select('-tareas')
    res.json(proyectos)

}

const nuevosProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body)
    proyecto.creador = req.usuario._id
    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
}

const obtenerProyecto = async (req, res) => {
    const { id } = req.params
    const valid = mongoose.Types.ObjectId.isValid(id)
    if (!valid) {
        const error = new Error('Proyecto No Encontrado')
        return res.status(404).json({ msg: error.message })
    }
    const proyecto = await Proyecto.findById(id.trim()).populate({ path: 'tareas', populate: { path: 'completado', select: "nombre" } }).populate('colaboradores', "nombre email")

    if (!proyecto) {
        const error = new Error('Proyecto No Encontrado')
        return res.status(404).json({ msg: error.message })
    }
    if (proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some((colaborador) => colaborador._id.toString() === req.usuario._id.toString())) {
        const error = new Error('Acción No Válida')
        return res.status(404).json({ msg: error.message })
    }

    res.json(
        proyecto
    )
}
const editarProyecto = async (req, res) => {
    const { id } = req.params
    const valid = mongoose.Types.ObjectId.isValid(id)
    if (!valid) {
        const error = new Error('Proyecto No Encontrado')
        return res.status(404).json({ msg: error.message })
    }
    const proyecto = await Proyecto.findById(id.trim())
    if (!proyecto) {
        const error = new Error('Proyecto No Encontrado')
        return res.status(404).json({ msg: error.message })
    }
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción No Válida')
        return res.status(404).json({ msg: error.message })
    }
    proyecto.nombre = req.body.nombre || proyecto.nombre
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega
    proyecto.cliente = req.body.cliente || proyecto.cliente
    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }

}
const eliminarProyecto = async (req, res) => {
    const { id } = req.params
    const valid = mongoose.Types.ObjectId.isValid(id)
    if (!valid) {
        const error = new Error('Proyecto No Encontrado')
        return res.status(404).json({ msg: error.message })
    }
    const proyecto = await Proyecto.findById(id.trim())
    if (!proyecto) {
        const error = new Error('Proyecto No Encontrado')
        return res.status(404).json({ msg: error.message })
    }
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción No Válida')
        return res.status(404).json({ msg: error.message })
    }
    try {
        await proyecto.deleteOne()
        res.json({
            msg: 'Proyecto Eliminado'
        })
    } catch (error) {
        console.log(error)
    }
}
const buscarColaborador = async (req, res) => {
    const { email } = req.body
    const usuario = await Usuario.findOne({ email }).select('-password -confirmado -createdAt -token -updatedAt -__v')
    if (!usuario) {
        const error = new Error('Usuario No Encontrado')
        return res.status(404).json({ msg: error.message })
    }
    res.json(usuario)

}
const agregarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)
    const valid = mongoose.Types.ObjectId.isValid(req.params.id)
    if (!valid) {
        const error = new Error('No Existe')
        return res.status(404).json({ msg: error.message })
    }
    if (!proyecto) {
        const error = new Error('Proyecto No Encontrado')
        return res.status(404).json({ msg: error.message })
    }
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción No Válida')
        return res.status(404).json({ msg: error.message })
    }

    const { email } = req.body
    const usuario = await Usuario.findOne({ email }).select('-password -confirmado -createdAt -token -updatedAt -__v')
    if (!usuario) {
        const error = new Error('Usuario No Encontrado')
        return res.status(404).json({ msg: error.message })
    }

    //EL COLABORADOR NO ES EL ADMIN DEL PROYECTO
    if (proyecto.creador.toString() === usuario._id.toString()) {
        const error = new Error('El creador del Proyecto no puede ser colaborador')
        return res.status(404).json({ msg: error.message })
    }

    //REVISAR QUE NO ESTE YA EN EL RPOYECTO
    if (proyecto.colaboradores.includes(usuario._id)) {
        const error = new Error('El Usuario ya pertenece al proyecto')
        return res.status(404).json({ msg: error.message })
    }

    //AGREGAR COLABORADOR
    proyecto.colaboradores.push(usuario._id)
    await proyecto.save()
    res.json({
        msg: 'Colaborador Agregado Correctamente'
    })

}
const eliminarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)
    const valid = mongoose.Types.ObjectId.isValid(req.params.id)
    if (!valid) {
        const error = new Error('No Existe')
        return res.status(404).json({ msg: error.message })
    }
    if (!proyecto) {
        const error = new Error('Proyecto No Encontrado')
        return res.status(404).json({ msg: error.message })
    }
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción No Válida')
        return res.status(404).json({ msg: error.message })
    }

    //ELIMINAR COLABORADOR 
    proyecto.colaboradores.pull(req.body.id)
    await proyecto.save()
    res.json({
        msg: 'Colaborador Eliminado Correctamente'
    })

}
// const obtenerTareas = async (req, res) => {
//     const {id} = req.params
//     const valid = mongoose.Types.ObjectId.isValid(id)
//     if(!valid){
//         const error = new Error('ID No Válido')
//         return res.status(404).json({msg: error.message})
//     } 
//     const existeProyecto = await Proyecto.findById(id.trim())
//     if(!existeProyecto){
//         const error = new Error('Proyecto No Encontrado')
//         return res.status(404).json({msg: error.message})
//     }
//     //TIENE QUE SER EL CREADOR DEL PROYECTO O COLABORADOR
//     const tareas = await Tarea.find().where('proyecto').equals(id)
//     res.json(tareas)

// }

export {
    obtenerProyecto,
    nuevosProyecto,
    obtenerProyectos,
    editarProyecto,
    eliminarColaborador,
    eliminarProyecto,
    agregarColaborador,
    buscarColaborador
}
