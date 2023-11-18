import bcrypt from 'bcrypt'

const usuarios = [
    {
        nombre: 'Angel Daniel',
        apellido: 'Lope San Martin',
        correo: 'correo@correo.com',
        password: bcrypt.hashSync('password',10),
        cargo: 'Encargado de Comunicaciones',
        confirmado: true,
        tipo: 'Administrador',
        departamentoId: 3
    },
    {
        nombre: 'Brandon Jared',
        apellido: 'Ruiz Diaz',
        correo: 'correo1@correo.com',
        password: bcrypt.hashSync('password',10),
        cargo: 'Jefe de Departamento',
        confirmado: true,
        tipo: 'Usuario',
        departamentoId: 1
    }
]

export default usuarios