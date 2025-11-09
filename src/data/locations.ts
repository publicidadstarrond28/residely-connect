// Data structure for countries, states, and cities
export interface City {
  name: string;
}

export interface State {
  name: string;
  cities: City[];
}

export interface Country {
  name: string;
  states: State[];
}

export const locationData: Country[] = [
  {
    name: "Venezuela",
    states: [
      {
        name: "Distrito Capital",
        cities: [
          { name: "Caracas" },
          { name: "El Junquito" },
          { name: "Caricuao" },
          { name: "Catia" },
          { name: "El Valle" },
          { name: "La Vega" },
          { name: "Macarao" },
          { name: "Petare" },
        ],
      },
      {
        name: "Miranda",
        cities: [
          { name: "Los Teques" },
          { name: "Guarenas" },
          { name: "Guatire" },
          { name: "Charallave" },
          { name: "Baruta" },
          { name: "Chacao" },
          { name: "El Hatillo" },
          { name: "Sucre" },
        ],
      },
      {
        name: "Aragua",
        cities: [
          { name: "Maracay" },
          { name: "Turmero" },
          { name: "La Victoria" },
          { name: "Cagua" },
          { name: "Villa de Cura" },
          { name: "El Limón" },
          { name: "San Mateo" },
        ],
      },
      {
        name: "Carabobo",
        cities: [
          { name: "Valencia" },
          { name: "Puerto Cabello" },
          { name: "Guacara" },
          { name: "San Diego" },
          { name: "Naguanagua" },
          { name: "Los Guayos" },
          { name: "Bejuma" },
        ],
      },
      {
        name: "Zulia",
        cities: [
          { name: "Maracaibo" },
          { name: "Cabimas" },
          { name: "Ciudad Ojeda" },
          { name: "Machiques" },
          { name: "Santa Bárbara" },
          { name: "San Francisco" },
        ],
      },
      {
        name: "Lara",
        cities: [
          { name: "Barquisimeto" },
          { name: "Cabudare" },
          { name: "Carora" },
          { name: "El Tocuyo" },
          { name: "Quíbor" },
        ],
      },
      {
        name: "Táchira",
        cities: [
          { name: "San Cristóbal" },
          { name: "Táriba" },
          { name: "Rubio" },
          { name: "San Antonio del Táchira" },
          { name: "La Fría" },
        ],
      },
      {
        name: "Mérida",
        cities: [
          { name: "Mérida" },
          { name: "El Vigía" },
          { name: "Ejido" },
          { name: "Tovar" },
          { name: "Santa Cruz de Mora" },
        ],
      },
      {
        name: "Bolívar",
        cities: [
          { name: "Ciudad Bolívar" },
          { name: "Puerto Ordaz" },
          { name: "San Félix" },
          { name: "Upata" },
          { name: "Caicara del Orinoco" },
        ],
      },
      {
        name: "Anzoátegui",
        cities: [
          { name: "Barcelona" },
          { name: "Puerto La Cruz" },
          { name: "Lechería" },
          { name: "El Tigre" },
          { name: "Anaco" },
        ],
      },
      {
        name: "Nueva Esparta",
        cities: [
          { name: "La Asunción" },
          { name: "Porlamar" },
          { name: "Juan Griego" },
          { name: "Pampatar" },
        ],
      },
    ],
  },
  {
    name: "Colombia",
    states: [
      {
        name: "Bogotá D.C.",
        cities: [
          { name: "Bogotá" },
          { name: "Usaquén" },
          { name: "Chapinero" },
          { name: "Suba" },
          { name: "Engativá" },
        ],
      },
      {
        name: "Antioquia",
        cities: [
          { name: "Medellín" },
          { name: "Bello" },
          { name: "Itagüí" },
          { name: "Envigado" },
          { name: "Rionegro" },
        ],
      },
      {
        name: "Valle del Cauca",
        cities: [
          { name: "Cali" },
          { name: "Palmira" },
          { name: "Buenaventura" },
          { name: "Tuluá" },
          { name: "Cartago" },
        ],
      },
      {
        name: "Cundinamarca",
        cities: [
          { name: "Soacha" },
          { name: "Facatativá" },
          { name: "Zipaquirá" },
          { name: "Chía" },
          { name: "Fusagasugá" },
        ],
      },
    ],
  },
  {
    name: "México",
    states: [
      {
        name: "Ciudad de México",
        cities: [
          { name: "Cuauhtémoc" },
          { name: "Miguel Hidalgo" },
          { name: "Benito Juárez" },
          { name: "Coyoacán" },
          { name: "Tlalpan" },
        ],
      },
      {
        name: "Jalisco",
        cities: [
          { name: "Guadalajara" },
          { name: "Zapopan" },
          { name: "Tlaquepaque" },
          { name: "Tonalá" },
          { name: "Puerto Vallarta" },
        ],
      },
      {
        name: "Nuevo León",
        cities: [
          { name: "Monterrey" },
          { name: "San Nicolás de los Garza" },
          { name: "Guadalupe" },
          { name: "Apodaca" },
          { name: "San Pedro Garza García" },
        ],
      },
    ],
  },
  {
    name: "Argentina",
    states: [
      {
        name: "Buenos Aires",
        cities: [
          { name: "Buenos Aires" },
          { name: "La Plata" },
          { name: "Mar del Plata" },
          { name: "Bahía Blanca" },
        ],
      },
      {
        name: "Córdoba",
        cities: [
          { name: "Córdoba" },
          { name: "Villa Carlos Paz" },
          { name: "Río Cuarto" },
          { name: "Villa María" },
        ],
      },
    ],
  },
  {
    name: "Chile",
    states: [
      {
        name: "Región Metropolitana",
        cities: [
          { name: "Santiago" },
          { name: "Puente Alto" },
          { name: "Maipú" },
          { name: "La Florida" },
        ],
      },
      {
        name: "Valparaíso",
        cities: [
          { name: "Valparaíso" },
          { name: "Viña del Mar" },
          { name: "Quilpué" },
          { name: "Villa Alemana" },
        ],
      },
    ],
  },
  {
    name: "Perú",
    states: [
      {
        name: "Lima",
        cities: [
          { name: "Lima" },
          { name: "Callao" },
          { name: "San Juan de Lurigancho" },
          { name: "San Martín de Porres" },
        ],
      },
      {
        name: "Cusco",
        cities: [
          { name: "Cusco" },
          { name: "Sicuani" },
          { name: "Urubamba" },
        ],
      },
    ],
  },
  {
    name: "Ecuador",
    states: [
      {
        name: "Pichincha",
        cities: [
          { name: "Quito" },
          { name: "Cayambe" },
          { name: "Sangolquí" },
        ],
      },
      {
        name: "Guayas",
        cities: [
          { name: "Guayaquil" },
          { name: "Durán" },
          { name: "Milagro" },
        ],
      },
    ],
  },
];

export const getCountries = (): string[] => {
  return locationData.map((country) => country.name);
};

export const getStatesByCountry = (countryName: string): string[] => {
  const country = locationData.find((c) => c.name === countryName);
  return country ? country.states.map((state) => state.name) : [];
};

export const getCitiesByState = (countryName: string, stateName: string): string[] => {
  const country = locationData.find((c) => c.name === countryName);
  if (!country) return [];
  
  const state = country.states.find((s) => s.name === stateName);
  return state ? state.cities.map((city) => city.name) : [];
};
