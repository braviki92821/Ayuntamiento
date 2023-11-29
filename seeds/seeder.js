import { Departamento, Solicitud, Usuario } from "../models/index.js"
import usuarios from "./usuarios.js"
import departamentos from "./departamentos.js"
import db from "../config/db.js"

const importarDatos = async () => {
    try {
      
      await db.authenticate()
  
      await db.sync()
  
      await Promise.all([
         await Departamento.bulkCreate(departamentos),
         await Usuario.bulkCreate(usuarios),
          //Solicitud.bulkCreate(),        
      ])
  
      console.log('Datos importados')
  
      process.exit()
      
    } catch (error) {
      console.log(error)
      process.exit(1)
    }
}

const eliminarDatos = async() => {
  try {
      await db.sync({force: true})
      console.log('Datos eliminados')
      process.exit() 
  } catch (error) {
      console.log(error)
      process.exit(1)
  }
}

if(process.argv[2]==="-i"){
    importarDatos();
}

if(process.argv[2]==="-e"){
  eliminarDatos();
}