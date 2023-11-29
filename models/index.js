import Departamento from "./Departamento.js";
import Solicitud from "./Solicitud.js";
import Usuario from "./Usuario.js";
import Aviso from "./Aviso.js";



Usuario.belongsTo(Departamento, {foraingKey: 'departamentoId'})
Solicitud.belongsTo(Usuario, {foraingKey: 'usuarioId'})
Solicitud.belongsTo(Departamento, {foraingKey: 'departamentoId'})
Aviso.belongsTo(Usuario, {foraingKey: 'usuarioId'})


export {
    Departamento,
    Solicitud,
    Usuario,
    Aviso
}