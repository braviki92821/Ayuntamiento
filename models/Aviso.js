import db from "../config/db.js";
import { DataTypes } from "sequelize";

const Aviso = db.define('avisos',{
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull:false,
        primaryKey:true
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mensaje: {
        type: DataTypes.TEXT,
        allowNull:false,
    },
    destino: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estado: DataTypes.BOOLEAN
});


export default Aviso