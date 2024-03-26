import express from "express"
import dotenv from 'dotenv'
import cors from 'cors'
import conectarDB from "./config/db.js"
import usuarioRoutes from "./routes/usuarioRoutes.js"
import proyectoRouter from "./routes/proyectoRoutes.js"
import tareaRouter from "./routes/tareaRoutes.js"

const app = express()
app.use(express.json());

dotenv.config();
conectarDB()

//Configurar CORS
const whitelist = [process.env.FRONTEND_URL, process.env.FRONTEND_URL2];
const corsOptions = {
    origin: function(origin,callback){
        if(whitelist.includes(origin)){
            //PUEDE CONSULTAR LA API
            callback(null, true)
        }else{
            //NO ESTA PERMITIDO
            callback(new Error('Error de Cors'))
        }
    }
}

app.use(cors(corsOptions))

//ROUTING
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/proyectos', proyectoRouter)
app.use('/api/tareas', tareaRouter)


const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () => {
    console.log(`Servidor corriendo el puerto ${PORT}`)
})

//SOCKET IO
import {Server} from 'socket.io'

const io = new Server(servidor,{
    pingTimeout: 60000,
    cors:{
        origin: process.env.FRONTEND_URL || process.env.FRONTEND_URL2
    }
})

io.on('connection',(socket)=>{
    console.log('Conectado a Socket.io');

    //DEFINIR LOS EVENTOS DE SOCKET IO
    socket.on('abrir proyecto', (proyecto)=>{
        socket.join(proyecto)
    })

    socket.on('nueva tarea',tarea=>{
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea agregada',tarea)
    })

    socket.on('eliminar tarea', tarea=>{
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea eliminada',tarea)
    })
    
    socket.on('actualizar tarea', tarea=>{
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('tarea actualizada',tarea)
    })

    socket.on('cambiar estado', tarea=>{
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('nuevo estado',tarea)
    })

})