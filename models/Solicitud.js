import { DataTypes } from 'sequelize'
import db from '../config/db.js'

const Solicitud = db.define('solicitudes', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull:false,
        primaryKey:true
    },
    titulo: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
    tipoRecurso: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
    Pedido:{
        type: DataTypes.STRING,
        allowNull: false
    },
    estatus: DataTypes.BOOLEAN,
    estado: DataTypes.BOOLEAN,
    observaciones: {
        type: DataTypes.STRING,
        defaultValue: ''
    }
 
});

export default Solicitud