import { DataTypes } from 'sequelize'
import db from '../config/db.js'
import bcrypt from 'bcrypt'

const Usuario = db.define('usuarios', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull:false,
        primaryKey:true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    correo: {
        type: DataTypes.STRING,
        allowNull: false    
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cargo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estado: DataTypes.BOOLEAN,
    token: DataTypes.STRING,
    confirmado: DataTypes.BOOLEAN,
    tipo: DataTypes.STRING
},{
    hooks: {
        beforeCreate: async (usuario)=>{
           const salt= await bcrypt.genSalt(10)
           usuario.password = await bcrypt.hash(usuario.password,salt)
        }
    },
    scopes:{
        eliminarPassword:{
            attributes:{
            exclude:['password', 'token', 'confirmado','createdAt','updatedAt' ]
            }
        }
    }
});


Usuario.prototype.verificarPassword = function(password){
    return bcrypt.compareSync(password,this.password)
}

export default Usuario