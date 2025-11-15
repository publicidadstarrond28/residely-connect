// Data structure for Venezuela location data
export interface Municipio {
  name: string;
  parroquias: string[];
}

export interface Estado {
  name: string;
  municipios: Municipio[];
}

export interface Country {
  name: string;
  estados: Estado[];
}

export const venezuelaData: Country = {
  name: "Venezuela",
  estados: [
    {
      name: "Amazonas",
      municipios: [
        {
          name: "Alto Orinoco",
          parroquias: ["Alto Orinoco", "Huachamacare", "Marawaka", "Mavaca", "Sierra Parima"]
        },
        {
          name: "Atabapo",
          parroquias: ["Atabapo", "Ucata", "Yapacana", "Caname"]
        },
        {
          name: "Atures",
          parroquias: ["Fernando Girón Tovar", "Luis Alberto Gómez", "Parhueña", "Platanillal"]
        },
        {
          name: "Autana",
          parroquias: ["Samariapo", "Sipapo", "Munduapo", "Guayapo"]
        },
        {
          name: "Manapiare",
          parroquias: ["Alto Ventuari", "Medio Ventuari", "Bajo Ventuari", "Manapiare"]
        },
        {
          name: "Maroa",
          parroquias: ["Maroa", "Victorino"]
        },
        {
          name: "Río Negro",
          parroquias: ["Casiquiare", "Cocuy", "San Carlos de Río Negro", "Solano"]
        }
      ]
    },
    {
      name: "Anzoátegui",
      municipios: [
        {
          name: "Anaco",
          parroquias: ["Anaco", "San Joaquín"]
        },
        {
          name: "Aragua",
          parroquias: ["Aragua de Barcelona", "Cachipo", "Bergantín"]
        },
        {
          name: "Bolívar",
          parroquias: ["Barcelona", "Pueblo Nuevo", "Cerro Negro"]
        },
        {
          name: "Bruzual",
          parroquias: ["Clarines", "Guanape", "Sabana de Uchire"]
        },
        {
          name: "Cajigal",
          parroquias: ["Onoto", "San Pablo"]
        },
        {
          name: "Carvajal",
          parroquias: ["Valle de Guanape", "Santa Bárbara"]
        },
        {
          name: "Diego Bautista Urbaneja",
          parroquias: ["Lechería", "El Morro"]
        },
        {
          name: "Freites",
          parroquias: ["Cantaura", "Libertador", "Santa Rosa", "Urica"]
        },
        {
          name: "Guanipa",
          parroquias: ["San José de Guanipa"]
        },
        {
          name: "Guanta",
          parroquias: ["Guanta"]
        },
        {
          name: "Independencia",
          parroquias: ["Soledad"]
        },
        {
          name: "Libertad",
          parroquias: ["Mamo"]
        },
        {
          name: "Miranda",
          parroquias: ["Pariaguán"]
        },
        {
          name: "Monagas",
          parroquias: ["San Mateo", "El Carito"]
        },
        {
          name: "Peñalver",
          parroquias: ["Puerto Píritu", "San Miguel"]
        },
        {
          name: "Píritu",
          parroquias: ["Píritu", "Boca de Uchire"]
        },
        {
          name: "San Juan de Capistrano",
          parroquias: ["Boca de Chávez", "Pueblo Latino"]
        },
        {
          name: "Santa Ana",
          parroquias: ["Santa Ana"]
        },
        {
          name: "Simón Rodríguez",
          parroquias: ["El Chaparro"]
        },
        {
          name: "Sotillo",
          parroquias: ["Puerto La Cruz", "Pozuelos"]
        }
      ]
    },
    {
      name: "Apure",
      municipios: [
        {
          name: "Achaguas",
          parroquias: ["Achaguas", "Apurito", "El Yagual", "Guachara", "Mucuritas", "Queseras del Medio"]
        },
        {
          name: "Biruaca",
          parroquias: ["Biruaca"]
        },
        {
          name: "Muñóz",
          parroquias: ["Bruzual", "Mantecal", "Quintero", "Rincón Hondo", "San Vicente"]
        },
        {
          name: "Páez",
          parroquias: ["Guasdualito", "Aramendi", "El Amparo", "San Camilo", "Urdaneta"]
        },
        {
          name: "Pedro Camejo",
          parroquias: ["San Juan de Payara", "Codazzi", "Cunaviche"]
        },
        {
          name: "Rómulo Gallegos",
          parroquias: ["Elorza", "La Trinidad"]
        },
        {
          name: "San Fernando",
          parroquias: ["San Fernando", "El Recreo", "Peñalver", "San Rafael de Atamaica"]
        }
      ]
    },
    {
      name: "Aragua",
      municipios: [
        {
          name: "Bolívar",
          parroquias: ["San Mateo", "Camatagua"]
        },
        {
          name: "Camatagua",
          parroquias: ["Carmen de Cura", "Camatagua"]
        },
        {
          name: "Francisco Linares Alcántara",
          parroquias: ["Santa Rita", "Francisco de Miranda", "Monseñor Feliciano González"]
        },
        {
          name: "Girardot",
          parroquias: ["Pedro José Ovalles", "Joaquín Crespo", "José Casanova Godoy", "Madre María de San José", "Andrés Eloy Blanco", "Los Tacariguas"]
        },
        {
          name: "José Ángel Lamas",
          parroquias: ["Santa Cruz"]
        },
        {
          name: "José Félix Ribas",
          parroquias: ["Juan Vicente Bolívar y Ponte", "Castor Nieves Ríos", "Las Guacamayas", "Pao de Zárate", "Zuata"]
        },
        {
          name: "José Rafael Revenga",
          parroquias: ["El Consejo"]
        },
        {
          name: "Libertador",
          parroquias: ["Palo Negro", "San Martín de Porres"]
        },
        {
          name: "Mario Briceño Iragorry",
          parroquias: ["El Limón", "Caña de Azúcar"]
        },
        {
          name: "Ocumare de la Costa de Oro",
          parroquias: ["Ocumare de la Costa"]
        },
        {
          name: "San Casimiro",
          parroquias: ["San Casimiro", "Güiripa", "Ollas de Caramacate", "Valle Morín"]
        },
        {
          name: "San Sebastián",
          parroquias: ["San Sebastián"]
        },
        {
          name: "Santiago Mariño",
          parroquias: ["Turmero", "Arevalo Aponte", "Chuao", "Samán de Güere", "Alfredo Pacheco Miranda"]
        },
        {
          name: "Santos Michelena",
          parroquias: ["Las Tejerías", "Tiara"]
        },
        {
          name: "Sucre",
          parroquias: ["Cagua", "Bella Vista"]
        },
        {
          name: "Tovar",
          parroquias: ["Tovar"]
        },
        {
          name: "Urdaneta",
          parroquias: ["Barbacoas", "San Francisco de Cara", "Taguay"]
        },
        {
          name: "Zamora",
          parroquias: ["Villa de Cura", "Magdaleno", "San Francisco de Asís", "Valles de Tucutunemo", "Augusto Mijares"]
        }
      ]
    },
    {
      name: "Barinas",
      municipios: [
        {
          name: "Alberto Arvelo Torrealba",
          parroquias: ["Sabaneta", "Juan Antonio Rodríguez Domínguez"]
        },
        {
          name: "Andrés Eloy Blanco",
          parroquias: ["El Cantón", "Santa Cruz de Guacas", "Puerto Vivas"]
        },
        {
          name: "Antonio José de Sucre",
          parroquias: ["Socopó", "Boconó", "Ticoporo", "Nicolás Pulido", "Andrés Bello"]
        },
        {
          name: "Arismendi",
          parroquias: ["Arismendi", "Guadarrama", "La Unión", "San Antonio", "Alberto Arvelo Larriva"]
        },
        {
          name: "Barinas",
          parroquias: ["Barinas", "Alfredo Arvelo Larriva", "San Silvestre", "Santa Inés", "Santa Lucía", "Torunos", "El Carmen", "Rómulo Betancourt", "Corazón de Jesús", "Ramón Ignacio Méndez"]
        },
        {
          name: "Bolívar",
          parroquias: ["Barinitas", "Altamira de Cáceres", "Calderas", "Manuel Palacio Fajardo"]
        },
        {
          name: "Cruz Paredes",
          parroquias: ["Barrancas", "El Socorro", "Masparrito"]
        },
        {
          name: "Ezequiel Zamora",
          parroquias: ["Santa Bárbara", "Pedro Briceño Méndez", "Ramón Ignacio Méndez", "José Ignacio del Pumar"]
        },
        {
          name: "Obispos",
          parroquias: ["Obispos", "El Real", "La Luz", "Los Guasimitos"]
        },
        {
          name: "Pedraza",
          parroquias: ["Ciudad Bolivia", "Ignacio Briceño", "José Félix Ribas", "Páez"]
        },
        {
          name: "Rojas",
          parroquias: ["Libertad", "Dolores", "Palacios Fajardo", "Santa Rosa", "Simón Rodríguez"]
        },
        {
          name: "Sosa",
          parroquias: ["Ciudad de Nutrias", "El Regalo", "Puerto Nutrias", "Santa Catalina", "Simón Bolívar"]
        }
      ]
    },
    {
      name: "Bolívar",
      municipios: [
        {
          name: "Caroní",
          parroquias: ["Cachamay", "Chirica", "Dalla Costa", "Once de Abril", "Simón Bolívar", "Unare", "Universidad", "Vista al Sol", "Pozo Verde", "Yocoima"]
        },
        {
          name: "Cedeño",
          parroquias: ["Ascensión Farreras", "Guaniamo", "La Urbana", "Pijiguaos"]
        },
        {
          name: "El Callao",
          parroquias: ["El Callao"]
        },
        {
          name: "Gran Sabana",
          parroquias: ["Ikabarú"]
        },
        {
          name: "Heres",
          parroquias: ["Catedral", "Zea", "Orinoco", "José Antonio Páez", "Marhuanta", "Agua Salada", "Vista Hermosa", "La Sabanita", "Panapana"]
        },
        {
          name: "Piar",
          parroquias: ["Andrés Eloy Blanco", "Pedro Cova"]
        },
        {
          name: "Angostura",
          parroquias: ["San Francisco", "Barceloneta", "Santa Bárbara", "Moruca"]
        },
        {
          name: "Roscio",
          parroquias: ["Salom", "Dalla Costa", "San Isidro"]
        },
        {
          name: "Sifontes",
          parroquias: ["Tumeremo", "Aripao", "San Antonio", "Las Majadas", "Moitaco"]
        },
        {
          name: "Sucre",
          parroquias: ["Maripa", "Aragua de Maturín", "Chaguaramas", "El Pinto", "Guarataro", "Tucupido", "Las Barrancas"]
        },
        {
          name: "Padre Pedro Chien",
          parroquias: ["Río Grande", "San José de Amacuro"]
        }
      ]
    },
    {
      name: "Carabobo",
      municipios: [
        {
          name: "Bejuma",
          parroquias: ["Bejuma", "Canoabo", "Simón Bolívar"]
        },
        {
          name: "Carlos Arvelo",
          parroquias: ["Güigüe", "Belén", "Tacarigua"]
        },
        {
          name: "Diego Ibarra",
          parroquias: ["Mariara", "Aguas Calientes"]
        },
        {
          name: "Guacara",
          parroquias: ["Guacara", "Ciudad Alianza", "Yagua"]
        },
        {
          name: "Juan José Mora",
          parroquias: ["Morón", "Urama"]
        },
        {
          name: "Libertador",
          parroquias: ["Tocuyito", "Independencia"]
        },
        {
          name: "Los Guayos",
          parroquias: ["Los Guayos"]
        },
        {
          name: "Miranda",
          parroquias: ["Miranda"]
        },
        {
          name: "Montalbán",
          parroquias: ["Montalbán"]
        },
        {
          name: "Naguanagua",
          parroquias: ["Naguanagua"]
        },
        {
          name: "Puerto Cabello",
          parroquias: ["Bartolomé Salom", "Democracia", "Fraternidad", "Goaigoaza", "Juan José Flores", "Unión", "Borburata", "Patanemo"]
        },
        {
          name: "San Diego",
          parroquias: ["San Diego"]
        },
        {
          name: "San Joaquín",
          parroquias: ["San Joaquín"]
        },
        {
          name: "Valencia",
          parroquias: ["Catedral", "Candelaria", "El Socorro", "Miguel Peña", "Rafael Urdaneta", "San Blas", "San José", "Santa Rosa"]
        }
      ]
    },
    {
      name: "Cojedes",
      municipios: [
        {
          name: "Anzoátegui",
          parroquias: ["Cojedes", "Juan de Mata Suárez"]
        },
        {
          name: "Pao de San Juan Bautista",
          parroquias: ["El Pao"]
        },
        {
          name: "Tinaquillo",
          parroquias: ["Tinaquillo"]
        },
        {
          name: "Girardot",
          parroquias: ["El Baúl", "Sucre"]
        },
        {
          name: "Lima Blanco",
          parroquias: ["Macapo", "La Aguadita"]
        },
        {
          name: "Ricaurte",
          parroquias: ["Libertad de Cojedes", "El Amparo"]
        },
        {
          name: "Rómulo Gallegos",
          parroquias: ["Las Vegas", "Rómulo Gallegos"]
        },
        {
          name: "Ezequiel Zamora",
          parroquias: ["San Carlos de Austria", "Juan Ángel Bravo", "Manuel Manrique"]
        },
        {
          name: "Tinaco",
          parroquias: ["Tinaco", "General en Jefe José Laurencio Silva"]
        }
      ]
    },
    {
      name: "Delta Amacuro",
      municipios: [
        {
          name: "Antonio Díaz",
          parroquias: ["Curiapo", "Almirante Luis Brión", "Francisco Aniceto Lugo", "Manuel Renaud", "Padre Barral", "Santos de Abelgas"]
        },
        {
          name: "Casacoima",
          parroquias: ["Imataca", "Juan Bautista Arismendi", "Manuel Piar", "Rómulo Gallegos"]
        },
        {
          name: "Pedernales",
          parroquias: ["Pedernales", "Luis Beltrán Prieto Figueroa"]
        },
        {
          name: "Tucupita",
          parroquias: ["Tucupita", "José Vidal Marcano", "Juan Millán", "Leonardo Ruíz Pineda", "Mariscal Antonio José de Sucre", "Monseñor Argimiro García", "San Rafael", "Virgen del Valle"]
        }
      ]
    },
    {
      name: "Distrito Capital",
      municipios: [
        {
          name: "Libertador",
          parroquias: [
            "23 de Enero",
            "Alta Gracia",
            "Antímano",
            "Candelaria",
            "Caricuao",
            "Catedral",
            "Coche",
            "El Junquito",
            "El Paraíso",
            "El Recreo",
            "El Valle",
            "La Pastora",
            "La Vega",
            "Macarao",
            "San Agustín",
            "San Bernardino",
            "San José",
            "San Juan",
            "San Pedro",
            "Santa Rosalía",
            "Santa Teresa",
            "Sucre"
          ]
        }
      ]
    },
    {
      name: "Falcón",
      municipios: [
        {
          name: "Acosta",
          parroquias: ["San Juan de los Cayos", "Capadare", "La Pastora", "Libertador"]
        },
        {
          name: "Bolívar",
          parroquias: ["San Luis", "Aracua", "La Peña"]
        },
        {
          name: "Buchivacoa",
          parroquias: ["Bariro", "Borojó", "Capatárida", "Guajiro", "Seque", "Zazárida"]
        },
        {
          name: "Cacique Manaure",
          parroquias: ["Yaracal"]
        },
        {
          name: "Carirubana",
          parroquias: ["Punta Cardón", "Carirubana", "Santa Ana", "Pueblo Nuevo"]
        },
        {
          name: "Colina",
          parroquias: ["La Vela de Coro", "Acurigua", "Guaibacoa", "Las Calderas", "Macoruca"]
        },
        {
          name: "Dabajuro",
          parroquias: ["Dabajuro"]
        },
        {
          name: "Democracia",
          parroquias: ["Pedregal", "Agua Clara", "Avaria", "Piedra Grande"]
        },
        {
          name: "Falcón",
          parroquias: ["Pueblo Nuevo", "Adícora"]
        },
        {
          name: "Federación",
          parroquias: ["Churuguara", "Agua Larga", "El Paují", "Independencia", "Mapararí"]
        },
        {
          name: "Jacura",
          parroquias: ["Jacura", "Agua Linda", "Araurima"]
        },
        {
          name: "Los Taques",
          parroquias: ["Los Taques", "Judibana"]
        },
        {
          name: "Mauroa",
          parroquias: ["Mene de Mauroa", "Casigua", "San Félix"]
        },
        {
          name: "Miranda",
          parroquias: ["Guzmán Guillermo", "Mitare", "Río Seco", "Sabaneta", "San Antonio", "San Gabriel"]
        },
        {
          name: "Monseñor Iturriza",
          parroquias: ["Chichiriviche", "Boca de Tocuyo", "Tocuyo de la Costa"]
        },
        {
          name: "Palmasola",
          parroquias: ["Palmasola"]
        },
        {
          name: "Petit",
          parroquias: ["Cabure", "Colina", "Curimagua"]
        },
        {
          name: "Píritu",
          parroquias: ["Píritu", "San José de la Costa"]
        },
        {
          name: "San Francisco",
          parroquias: ["San Francisco"]
        },
        {
          name: "Sucre",
          parroquias: ["Sucre", "Pecaya"]
        },
        {
          name: "Tocópero",
          parroquias: ["Tocópero"]
        },
        {
          name: "Unión",
          parroquias: ["Santa Cruz de Bucaral", "Bariro"]
        },
        {
          name: "Urumaco",
          parroquias: ["Urumaco", "Bruzual"]
        },
        {
          name: "Zamora",
          parroquias: ["Puerto Cumarebo", "La Ciénaga", "La Soledad", "Pueblo Cumarebo", "Zazárida"]
        }
      ]
    },
    {
      name: "Guárico",
      municipios: [
        {
          name: "Camaguán",
          parroquias: ["Camaguán", "Puerto Miranda", "Uverito"]
        },
        {
          name: "Chaguaramas",
          parroquias: ["Chaguaramas"]
        },
        {
          name: "El Socorro",
          parroquias: ["El Socorro"]
        },
        {
          name: "Francisco de Miranda",
          parroquias: ["Calabozo", "El Calvario", "El Rastro", "Guardatinajas"]
        },
        {
          name: "José Félix Ribas",
          parroquias: ["Tucupido", "San Rafael de Laya"]
        },
        {
          name: "José Tadeo Monagas",
          parroquias: ["Altagracia de Orituco", "San Rafael de Orituco", "San Francisco Javier de Lezama", "Paso Real de Macaira", "Carlos Soublette", "San Francisco de Macaira", "Libertad de Orituco"]
        },
        {
          name: "Juan Germán Roscio",
          parroquias: ["San Juan de los Morros", "Cantagallo", "Parapara"]
        },
        {
          name: "Julián Mellado",
          parroquias: ["El Sombrero", "Sosa"]
        },
        {
          name: "Las Mercedes",
          parroquias: ["Las Mercedes", "Cabruta", "Santa Rita de Manapire"]
        },
        {
          name: "Leonardo Infante",
          parroquias: ["Valle de la Pascua", "Espino"]
        },
        {
          name: "Pedro Zaraza",
          parroquias: ["Zaraza", "San José de Unare"]
        },
        {
          name: "Ortíz",
          parroquias: ["Ortíz", "San Francisco de Tiznados", "San José de Tiznados", "San Lorenzo de Tiznados"]
        },
        {
          name: "San Gerónimo de Guayabal",
          parroquias: ["Guayabal", "Cazorla"]
        },
        {
          name: "San José de Guaribe",
          parroquias: ["San José de Guaribe"]
        },
        {
          name: "Santa María de Ipire",
          parroquias: ["Santa María de Ipire", "Altamira"]
        }
      ]
    },
    {
      name: "Lara",
      municipios: [
        {
          name: "Andrés Eloy Blanco",
          parroquias: ["Quebrada Honda de Guache", "Pío Tamayo", "Yacambú"]
        },
        {
          name: "Crespo",
          parroquias: ["Freitez", "José María Blanco"]
        },
        {
          name: "Iribarren",
          parroquias: ["Concepción", "Juan de Villegas", "Santa Rosa", "Tamaca", "Unión", "El Cují", "Juan Bautista Rodríguez", "Cuara", "Diego de Lozada", "Paraíso de San José", "San Miguel", "Tintorero", "José Bernardo Dorante", "Coronel Mariano Peraza"]
        },
        {
          name: "Jiménez",
          parroquias: ["Juan Bautista Rodríguez", "Cuara", "Diego de Lozada", "Paraíso de San José", "San Miguel", "Tintorero", "José Bernardo Dorante", "Coronel Mariano Peraza"]
        },
        {
          name: "Morán",
          parroquias: ["Anzoátegui", "Bolívar", "Guárico", "Hilario Luna y Luna", "Humocaro Alto", "Humocaro Bajo", "La Candelaria", "Morán"]
        },
        {
          name: "Palavecino",
          parroquias: ["Cabudare", "José Gregorio Bastidas", "Agua Viva"]
        },
        {
          name: "Simón Planas",
          parroquias: ["Sarare", "Buría", "Gustavo Vega"]
        },
        {
          name: "Torres",
          parroquias: ["Altagracia", "Antonio Díaz", "Camacaro", "Castañeda", "Cecilio Zubillaga", "Chiquinquirá", "El Blanco", "Espinoza de los Monteros", "Heriberto Arrollo", "Lara", "Las Mercedes", "Manuel Morillo", "Montaña Verde", "Montes de Oca", "Reyes de Vargas", "Torres"]
        },
        {
          name: "Urdaneta",
          parroquias: ["Siquisique", "San Miguel", "Moroturo", "Xaguas"]
        }
      ]
    },
    {
      name: "Mérida",
      municipios: [
        {
          name: "Alberto Adriani",
          parroquias: ["El Vigía", "La Punta", "Santa Elena del Arenal"]
        },
        {
          name: "Andrés Bello",
          parroquias: ["Santa María de Caparo"]
        },
        {
          name: "Antonio Pinto Salinas",
          parroquias: ["Aragüita", "Arévalo González", "Capurí", "Chacantá", "El Molino", "Guaimaral", "Mucutuy", "Mucuchachí"]
        },
        {
          name: "Aricagua",
          parroquias: ["Aricagua", "San Antonio"]
        },
        {
          name: "Arzobispo Chacón",
          parroquias: ["Canaguá", "Capurí", "El Cobre", "Chacantá", "Guaimaral", "Mucutuy", "Mucuchachí"]
        },
        {
          name: "Campo Elías",
          parroquias: ["Ejido", "Ignacio Fernández Peña", "Montalbán", "Fernández Peña"]
        },
        {
          name: "Caracciolo Parra Olmedo",
          parroquias: ["Florencio Ramírez", "Presidente Betancourt"]
        },
        {
          name: "Cardenal Quintero",
          parroquias: ["Santo Domingo", "Las Piedras"]
        },
        {
          name: "Guaraque",
          parroquias: ["Guaraque", "Mesa de Quintero", "Río Negro"]
        },
        {
          name: "Julio César Salas",
          parroquias: ["Arapuey", "Palmira"]
        },
        {
          name: "Justo Briceño",
          parroquias: ["Torondoy", "San Cristóbal de Torondoy"]
        },
        {
          name: "Libertador",
          parroquias: ["Mérida", "El Morro", "Arias", "Caracciolo Parra Olmedo", "Domingo Peña", "Juan Rodríguez Suárez", "Lasso de la Vega", "Mariano Picón Salas", "Milla", "Osuna Rodríguez", "Sagrario", "El Llano", "Antonio Spinetti Dini", "La Parroquia", "Alberto Adriani", "Los Nevados"]
        },
        {
          name: "Miranda",
          parroquias: ["Timotes", "Andrés Eloy Blanco", "La Mesa", "Pueblo Llano"]
        },
        {
          name: "Obispo Ramos de Lora",
          parroquias: ["Santa Elena de Arenales", "Eloy Paredes", "San Rafael de Alcázar"]
        },
        {
          name: "Padre Noguera",
          parroquias: ["Santa María de Caparo"]
        },
        {
          name: "Pueblo Llano",
          parroquias: ["Pueblo Llano"]
        },
        {
          name: "Rangel",
          parroquias: ["Mucuchíes", "Cacute", "La Toma", "Mucurubá", "San Rafael"]
        },
        {
          name: "Rivas Dávila",
          parroquias: ["Bailadores", "Gerónimo Maldonado"]
        },
        {
          name: "Santos Marquina",
          parroquias: ["Tabay"]
        },
        {
          name: "Sucre",
          parroquias: ["Lagunillas", "Chiguará", "Estánquez", "La Trampa", "Pueblo Nuevo del Sur", "San Juan"]
        },
        {
          name: "Tovar",
          parroquias: ["Tovar", "El Amparo", "San Francisco", "El Llano", "Santa María"]
        },
        {
          name: "Tulio Febres Cordero",
          parroquias: ["Independencia", "María de la Concepción Palacios Blanco", "Santa Apolonia", "El Morro"]
        },
        {
          name: "Zea",
          parroquias: ["Zea", "Caño El Tigre"]
        }
      ]
    },
    {
      name: "Miranda",
      municipios: [
        {
          name: "Acevedo",
          parroquias: ["Caucagua", "Aragüita", "Arévalo González", "Capaya", "El Café", "Marizapa", "Panaquire", "Ribas"]
        },
        {
          name: "Andrés Bello",
          parroquias: ["San José de Barlovento"]
        },
        {
          name: "Baruta",
          parroquias: ["Baruta", "El Cafetal", "Las Minas de Baruta"]
        },
        {
          name: "Brión",
          parroquias: ["Higuerote", "Curiepe", "Tacarigua de Brión"]
        },
        {
          name: "Buroz",
          parroquias: ["Mamporal"]
        },
        {
          name: "Carrizal",
          parroquias: ["Carrizal"]
        },
        {
          name: "Chacao",
          parroquias: ["Chacao"]
        },
        {
          name: "Cristóbal Rojas",
          parroquias: ["Charallave", "Las Brisas"]
        },
        {
          name: "El Hatillo",
          parroquias: ["El Hatillo"]
        },
        {
          name: "Guaicaipuro",
          parroquias: ["Los Teques", "Altagracia de la Montaña", "Cecilio Acosta", "El Jarillo", "Paracotos", "San Pedro", "Tácata"]
        },
        {
          name: "Independencia",
          parroquias: ["Santa Teresa del Tuy", "El Cartanal", "Ocumare del Tuy"]
        },
        {
          name: "Lander",
          parroquias: ["Ocumare del Tuy", "La Democracia", "Santa Bárbara"]
        },
        {
          name: "Los Salias",
          parroquias: ["San Antonio de los Altos"]
        },
        {
          name: "Páez",
          parroquias: ["Río Chico", "El Guapo", "Tacarigua de la Laguna", "Paparo", "San Fernando del Guapo"]
        },
        {
          name: "Paz Castillo",
          parroquias: ["Santa Lucía del Tuy"]
        },
        {
          name: "Pedro Gual",
          parroquias: ["Cúpira", "Machurucuto"]
        },
        {
          name: "Plaza",
          parroquias: ["Guarenas"]
        },
        {
          name: "Simón Bolívar",
          parroquias: ["San Francisco de Yare", "San Antonio de Yare"]
        },
        {
          name: "Sucre",
          parroquias: ["Petare", "Caucagüita", "Fila de Mariche", "La Dolorita", "Leoncio Martínez"]
        },
        {
          name: "Urdaneta",
          parroquias: ["Cúa", "Nueva Cúa"]
        },
        {
          name: "Zamora",
          parroquias: ["Guatire", "Bolívar"]
        }
      ]
    },
    {
      name: "Monagas",
      municipios: [
        {
          name: "Acosta",
          parroquias: ["San Antonio de Capayacuar", "San Francisco de Capayacuar"]
        },
        {
          name: "Aguasay",
          parroquias: ["Aguasay"]
        },
        {
          name: "Bolívar",
          parroquias: ["El Tejero", "Libertad de Orituco"]
        },
        {
          name: "Caripe",
          parroquias: ["Caripe", "El Guácharo", "La Guanota", "Sabana de Piedra", "San Agustín", "Teresén"]
        },
        {
          name: "Cedeño",
          parroquias: ["Caicara de Maturín", "Areo", "San Félix de Cantalicio", "Viento Fresco"]
        },
        {
          name: "Ezequiel Zamora",
          parroquias: ["El Furrial", "Jusepín", "La Pica", "San Vicente"]
        },
        {
          name: "Libertador",
          parroquias: ["Maturín", "Alto de los Godos", "Boquerón", "Las Cocuizas", "San Simón", "Santa Cruz", "El Corozo", "El Pinto", "San Lorenzo"]
        },
        {
          name: "Maturín",
          parroquias: ["Maturín", "Alto de los Godos", "Boquerón", "Las Cocuizas", "San Simón", "Santa Cruz", "El Corozo", "El Pinto", "San Lorenzo"]
        },
        {
          name: "Piar",
          parroquias: ["Aguasay", "Caripito", "El Tejero"]
        },
        {
          name: "Punceres",
          parroquias: ["Quiriquire", "Cachipo"]
        },
        {
          name: "Santa Bárbara",
          parroquias: ["Santa Bárbara"]
        },
        {
          name: "Sotillo",
          parroquias: ["Barrancas del Orinoco", "Los Barrancos de Fajardo"]
        },
        {
          name: "Uracoa",
          parroquias: ["Uracoa"]
        }
      ]
    },
    {
      name: "Nueva Esparta",
      municipios: [
        {
          name: "Antolín del Campo",
          parroquias: ["La Plaza de Paraguachí"]
        },
        {
          name: "Arismendi",
          parroquias: ["San Juan Bautista"]
        },
        {
          name: "Díaz",
          parroquias: ["Zabala", "Boca de Río"]
        },
        {
          name: "García",
          parroquias: ["García", "Francisco Fajardo"]
        },
        {
          name: "Gómez",
          parroquias: ["Bolívar", "Guevara", "Matasiete", "Santa Ana", "Sucre"]
        },
        {
          name: "Maneiro",
          parroquias: ["Aguirre", "Maneiro"]
        },
        {
          name: "Marcano",
          parroquias: ["Adrián", "Juan Griego"]
        },
        {
          name: "Mariño",
          parroquias: ["Porlamar"]
        },
        {
          name: "Península de Macanao",
          parroquias: ["San Francisco de Macanao", "Boca de Río"]
        },
        {
          name: "Tubores",
          parroquias: ["Los Barales", "Vicente Fuentes"]
        },
        {
          name: "Villalba",
          parroquias: ["San Pedro de Coche", "Vicente Fuentes"]
        }
      ]
    },
    {
      name: "Portuguesa",
      municipios: [
        {
          name: "Araure",
          parroquias: ["Araure", "Río Acarigua"]
        },
        {
          name: "Esteller",
          parroquias: ["Píritu", "Uveral"]
        },
        {
          name: "Guanare",
          parroquias: ["Guanare", "Córdoba", "San José de la Montaña", "San Juan de Guanaguanare", "Virgen de la Coromoto"]
        },
        {
          name: "Guanarito",
          parroquias: ["Guanarito", "Trinidad de la Capilla", "Divina Pastora"]
        },
        {
          name: "Monseñor José Vicente de Unda",
          parroquias: ["Chabasquén", "Peña Blanca"]
        },
        {
          name: "Ospino",
          parroquias: ["Ospino", "Aparición", "La Estación"]
        },
        {
          name: "Páez",
          parroquias: ["Acarigua", "Payara", "Pimpinela", "Ramón Peraza"]
        },
        {
          name: "Papelón",
          parroquias: ["Boconoíto", "Antolín Tovar"]
        },
        {
          name: "San Genaro de Boconoíto",
          parroquias: ["San Genaro de Boconoíto", "Antolín Tovar"]
        },
        {
          name: "San Rafael de Onoto",
          parroquias: ["San Rafael de Onoto", "Santa Fe", "Thermo Morales"]
        },
        {
          name: "Santa Rosalía",
          parroquias: ["Santa Rosalía", "Florida"]
        },
        {
          name: "Sucre",
          parroquias: ["Biscucuy", "Concepción", "San José de Saguaz", "San Rafael de Palo Alzado", "Uvencio Antonio Velásquez", "Villa Rosa"]
        },
        {
          name: "Turén",
          parroquias: ["Villa Bruzual", "Canelones", "Santa Cruz", "San Isidro Labrador"]
        }
      ]
    },
    {
      name: "Sucre",
      municipios: [
        {
          name: "Andrés Eloy Blanco",
          parroquias: ["Mariño", "Rómulo Gallegos"]
        },
        {
          name: "Andrés Mata",
          parroquias: ["San José de Aerocuar", "Tavera Acosta"]
        },
        {
          name: "Arismendi",
          parroquias: ["Río Caribe", "Antonio José de Sucre", "El Morro de Puerto Santo", "Puerto Santo", "San Juan de las Galdonas"]
        },
        {
          name: "Benítez",
          parroquias: ["El Pilar", "El Rincón", "General Francisco Antonio Vásquez", "Guaraúnos", "Tunapuicito", "Unión"]
        },
        {
          name: "Bermúdez",
          parroquias: ["Cumaná", "Altagracia", "Santa Inés", "Valentín Valiente", "Ayacucho", "San Juan", "Raúl Leoni", "Gran Mariscal"]
        },
        {
          name: "Bolívar",
          parroquias: ["Marigüitar", "Araya"]
        },
        {
          name: "Cajigal",
          parroquias: ["Yaguaraparo", "El Paujil", "Libertad"]
        },
        {
          name: "Cruz Salmerón Acosta",
          parroquias: ["Araya", "Chacopata", "Manicuare"]
        },
        {
          name: "Libertador",
          parroquias: ["Tunapuy", "Campo Elías"]
        },
        {
          name: "Mariño",
          parroquias: ["Irapa", "Campo Claro", "Marabal", "San Antonio de Irapa", "Soro"]
        },
        {
          name: "Mejía",
          parroquias: ["San Antonio del Golfo"]
        },
        {
          name: "Montes",
          parroquias: ["Cumanacoa", "Arenas", "Aricagua", "Cocollar", "San Fernando", "San Lorenzo"]
        },
        {
          name: "Ribero",
          parroquias: ["Cariaco", "Catuaro", "Rendón", "Santa Cruz", "Santa María"]
        },
        {
          name: "Sucre",
          parroquias: ["Cumaná", "Altagracia", "Santa Inés", "Valentín Valiente", "Ayacucho", "San Juan", "Raúl Leoni", "Gran Mariscal"]
        },
        {
          name: "Valdez",
          parroquias: ["Güiria", "Bideau", "Cristóbal Colón", "Punta de Piedras"]
        }
      ]
    },
    {
      name: "Táchira",
      municipios: [
        {
          name: "Andrés Bello",
          parroquias: ["Cordero"]
        },
        {
          name: "Antonio Rómulo Costa",
          parroquias: ["Las Mesas"]
        },
        {
          name: "Ayacucho",
          parroquias: ["San Juan de Colón", "San José del Palmar"]
        },
        {
          name: "Bolívar",
          parroquias: ["San Antonio del Táchira", "Palotal"]
        },
        {
          name: "Cárdenas",
          parroquias: ["Táriba", "Amenodoro Rangel Lamus"]
        },
        {
          name: "Córdoba",
          parroquias: ["Santa Ana del Táchira"]
        },
        {
          name: "Fernández Feo",
          parroquias: ["San Rafael del Piñal", "Santo Domingo"]
        },
        {
          name: "Francisco de Miranda",
          parroquias: ["San José de Bolívar"]
        },
        {
          name: "García de Hevia",
          parroquias: ["La Fría", "Boca de Grita"]
        },
        {
          name: "Guásimos",
          parroquias: ["Palmira"]
        },
        {
          name: "Independencia",
          parroquias: ["Capacho Nuevo", "Capacho Viejo", "San Pedro del Río"]
        },
        {
          name: "Jáuregui",
          parroquias: ["La Grita", "Emilio Constantino Guerrero", "Monseñor Miguel Antonio Salas"]
        },
        {
          name: "José María Vargas",
          parroquias: ["El Cobre"]
        },
        {
          name: "Junín",
          parroquias: ["Rubio", "Bramón", "La Petrólea"]
        },
        {
          name: "Libertad",
          parroquias: ["Capacho Nuevo", "Capacho Viejo"]
        },
        {
          name: "Libertador",
          parroquias: ["Abejales", "San Joaquín de Navay", "Doradas", "Emeterio Ochoa", "San Juan de Navay"]
        },
        {
          name: "Lobatera",
          parroquias: ["Lobatera", "Constitución"]
        },
        {
          name: "Michelena",
          parroquias: ["Michelena"]
        },
        {
          name: "Panamericano",
          parroquias: ["Coloncito", "La Palmita"]
        },
        {
          name: "Pedro María Ureña",
          parroquias: ["Ureña", "Nueva Arcadia"]
        },
        {
          name: "Rafael Urdaneta",
          parroquias: ["Delicias"]
        },
        {
          name: "Samuel Darío Maldonado",
          parroquias: ["San Judas Tadeo"]
        },
        {
          name: "San Cristóbal",
          parroquias: ["San Cristóbal", "Francisco Romero Lobo", "La Concordia", "Pedro María Morantes", "Juan Vicente Gómez", "San José Obrero", "Cárdenas", "Rómulo Betancourt"]
        },
        {
          name: "Sebastián",
          parroquias: ["La Tendida"]
        },
        {
          name: "Simón Rodríguez",
          parroquias: ["San Simón"]
        },
        {
          name: "Sucre",
          parroquias: ["Queniquea", "Eleazar López Contreras", "San Pablo"]
        },
        {
          name: "Torbes",
          parroquias: ["San Josecito"]
        },
        {
          name: "Uribante",
          parroquias: ["Pregonero", "Cardenas", "Potosi", "Papelon"]
        }
      ]
    },
    {
      name: "Trujillo",
      municipios: [
        {
          name: "Andrés Bello",
          parroquias: ["Santa Isabel", "Araguaney"]
        },
        {
          name: "Boconó",
          parroquias: ["Boconó", "El Carmen", "Mosquey", "Ayacucho", "Burbusay", "General Ribas", "Guaramacal", "Vega de Guaramacal", "Monseñor Jáuregui", "Rafael Rangel", "San Miguel", "San José"]
        },
        {
          name: "Bolívar",
          parroquias: ["Sabana Grande", "Cheregüé", "Granados"]
        },
        {
          name: "Candelaria",
          parroquias: ["Chejendé", "Arnoldo Gabaldón", "Bolivia"]
        },
        {
          name: "Carache",
          parroquias: ["Carache", "Cuicas", "La Concepción", "Panamericana", "Santa Cruz"]
        },
        {
          name: "Escuque",
          parroquias: ["Escuque", "La Unión", "Santa Rita", "Sabana Libre"]
        },
        {
          name: "J. Felipe Márquez Cañizalez",
          parroquias: ["El Socorro", "Los Caprichos", "Antonio José de Sucre"]
        },
        {
          name: "Juan Vicente Campos Elías",
          parroquias: ["Campo Elías", "Arnoldo Gabaldón"]
        },
        {
          name: "La Ceiba",
          parroquias: ["Santa Apolonia", "El Progreso", "La Ceiba", "Tres de Febrero"]
        },
        {
          name: "Miranda",
          parroquias: ["El Dividive", "Agua Santa", "Agua Caliente", "El Cenizo", "Valerita"]
        },
        {
          name: "Monte Carmelo",
          parroquias: ["Monte Carmelo", "Buena Vista", "Santa María del Horcón"]
        },
        {
          name: "Motatán",
          parroquias: ["Motatán", "El Baño", "Jalisco"]
        },
        {
          name: "Pampán",
          parroquias: ["Pampán", "Flor de Patria", "La Paz"]
        },
        {
          name: "Pampanito",
          parroquias: ["Pampanito", "La Concepción", "Pampanito II"]
        },
        {
          name: "Rafael Rangel",
          parroquias: ["Betijoque", "José Gregorio Hernández", "La Pueblita", "Los Cedros"]
        },
        {
          name: "San Rafael de Carvajal",
          parroquias: ["Carvajal", "Antonio Nicolás Briceño", "Campo Alegre", "José Leonardo Suárez"]
        },
        {
          name: "Sucre",
          parroquias: ["Sabana de Mendoza", "El Paraíso", "Junín", "Valmore Rodríguez"]
        },
        {
          name: "Urdaneta",
          parroquias: ["La Quebrada", "Jajó", "La Mesa", "Santiago"]
        },
        {
          name: "Valera",
          parroquias: ["Valera", "Juan Ignacio Montilla", "La Beatriz", "Mercedes Díaz", "San Luis"]
        }
      ]
    },
    {
      name: "Vargas",
      municipios: [
        {
          name: "Vargas",
          parroquias: [
            "Caraballeda",
            "Carayaca",
            "Carlos Soublette",
            "Caruao",
            "Catia La Mar",
            "El Junko",
            "La Guaira",
            "Macuto",
            "Maiquetía",
            "Naiguatá",
            "Urimare"
          ]
        }
      ]
    },
    {
      name: "Yaracuy",
      municipios: [
        {
          name: "Arístides Bastidas",
          parroquias: ["San Pablo"]
        },
        {
          name: "Bolívar",
          parroquias: ["Aroa"]
        },
        {
          name: "Bruzual",
          parroquias: ["Chivacoa", "Campo Elías"]
        },
        {
          name: "Cocorote",
          parroquias: ["Cocorote"]
        },
        {
          name: "Independencia",
          parroquias: ["Independencia"]
        },
        {
          name: "José Antonio Páez",
          parroquias: ["Sabana de Parra"]
        },
        {
          name: "La Trinidad",
          parroquias: ["Boraure"]
        },
        {
          name: "Manuel Monge",
          parroquias: ["Yumare"]
        },
        {
          name: "Nirgua",
          parroquias: ["Nirgua", "Salom", "Temerla"]
        },
        {
          name: "Peña",
          parroquias: ["San Andrés"]
        },
        {
          name: "San Felipe",
          parroquias: ["San Felipe", "Albarico", "San Javier"]
        },
        {
          name: "Sucre",
          parroquias: ["Guama", "Sucre"]
        },
        {
          name: "Urachiche",
          parroquias: ["Urachiche"]
        },
        {
          name: "Veroes",
          parroquias: ["Farriar", "El Guayabo"]
        }
      ]
    },
    {
      name: "Zulia",
      municipios: [
        {
          name: "Almirante Padilla",
          parroquias: ["Isla de Toas", "Monagas"]
        },
        {
          name: "Baralt",
          parroquias: ["San Timoteo", "General Urdaneta", "Libertador", "Marcelino Briceño", "Pueblo Nuevo", "Manuel Guanipa Matos"]
        },
        {
          name: "Cabimas",
          parroquias: ["Ambrosio", "Carmen Herrera", "La Rosa", "Germán Ríos Linares", "San Benito", "Rómulo Betancourt", "Jorge Hernández", "Punta Gorda", "Arístides Calvani"]
        },
        {
          name: "Catatumbo",
          parroquias: ["Encontrados", "Udón Pérez"]
        },
        {
          name: "Colón",
          parroquias: ["San Carlos del Zulia", "Moralito", "Santa Bárbara", "Santa Cruz del Zulia", "Urribarrí"]
        },
        {
          name: "Francisco Javier Pulgar",
          parroquias: ["Simón Rodríguez", "Carlos Quevedo", "Francisco Javier Pulgar"]
        },
        {
          name: "Jesús Enrique Lossada",
          parroquias: ["La Concepción", "José Ramón Yépez", "Mariano Parra León", "San José"]
        },
        {
          name: "Jesús María Semprún",
          parroquias: ["Bachaquero", "Libertad", "El Venado", "Mene Grande"]
        },
        {
          name: "La Cañada de Urdaneta",
          parroquias: ["Concepción", "Andrés Bello", "Chiquinquirá", "El Carmelo", "Potreritos"]
        },
        {
          name: "Lagunillas",
          parroquias: ["Libertad", "Alonso de Ojeda", "Venezuela", "Eleazar López Contreras", "Campo Lara"]
        },
        {
          name: "Machiques de Perijá",
          parroquias: ["Machiques", "Libertad", "Río Negro", "San José de Perijá"]
        },
        {
          name: "Mara",
          parroquias: ["San Rafael", "La Sierrita", "Las Parcelas", "Luis de Vicente", "Monseñor Marcos Sergio Godoy", "Ricaurte", "Tamare"]
        },
        {
          name: "Maracaibo",
          parroquias: [
            "Antonio Borjas Romero",
            "Bolívar",
            "Cacique Mara",
            "Carracciolo Parra Pérez",
            "Cecilio Acosta",
            "Chiquinquirá",
            "Coquivacoa",
            "Idelfonzo Vásquez",
            "Juana de Ávila",
            "Manuel Dagnino",
            "Olegario Villalobos",
            "Países Bajos",
            "Raúl Leoni",
            "San Isidro",
            "Santa Lucía",
            "Venancio Pulgar",
            "Luis Hurtado Higuera"
          ]
        },
        {
          name: "Miranda",
          parroquias: ["Los Puertos de Altagracia", "José Domingo Rus"]
        },
        {
          name: "Páez",
          parroquias: ["Sinamaica", "Alta Guajira", "Elías Sánchez Rubio", "Guajira"]
        },
        {
          name: "Rosario de Perijá",
          parroquias: ["San Francisco", "El Bajo", "Domitila Flores", "Francisco Ochoa", "Los Cortijos", "Mariano Parra León", "José Domingo Rus"]
        },
        {
          name: "San Francisco",
          parroquias: ["San Francisco", "El Bajo", "Domitila Flores", "Francisco Ochoa", "Los Cortijos", "Mariano Parra León", "José Domingo Rus"]
        },
        {
          name: "Santa Rita",
          parroquias: ["Santa Rita", "El Mene", "José Cenobio Urribarrí", "Pedro Lucas Urribarrí"]
        },
        {
          name: "Simón Bolívar",
          parroquias: ["Carlos Quevedo", "Francisco Javier Pulgar"]
        },
        {
          name: "Sucre",
          parroquias: ["Bobures", "El Batey", "Gibraltar", "Heras", "Monseñor Arturo Álvarez", "Rómulo Gallegos"]
        },
        {
          name: "Valmore Rodríguez",
          parroquias: ["La Victoria", "Rafael Urdaneta", "Raúl Cuenca"]
        }
      ]
    }
  ]
};

export const getEstados = (): string[] => {
  return venezuelaData.estados.map((estado) => estado.name);
};

export const getMunicipiosByEstado = (estadoName: string): string[] => {
  const estado = venezuelaData.estados.find((e) => e.name === estadoName);
  return estado ? estado.municipios.map((municipio) => municipio.name) : [];
};

export const getParroquiasByMunicipio = (estadoName: string, municipioName: string): string[] => {
  const estado = venezuelaData.estados.find((e) => e.name === estadoName);
  if (!estado) return [];
  
  const municipio = estado.municipios.find((m) => m.name === municipioName);
  return municipio ? municipio.parroquias : [];
};
