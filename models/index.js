import Departamento from "./Departamento.js";
import Solicitud from "./Solicitud.js";
import Usuario from "./Usuario.js";



Usuario.belongsTo(Departamento, {foraingKey: 'departamentoId'})
Solicitud.belongsTo(Usuario, {foraingKey: 'usuarioId'})
Solicitud.belongsTo(Departamento, {foraingKey: 'departamentoId'})


export {
    Departamento,
    Solicitud,
    Usuario
}