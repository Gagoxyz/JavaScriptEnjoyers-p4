/**
* usuarios y tarjetas a modo de arrays de objetos
*/

const users = [
    { name: "Adolfo Tacaño", email: "atacano@uoc.edu", password: "1234" },
    { name: "Paco García", email: "pgarcia@uoc.edu", password: "1234" },
    { name: "Luisa Gartiguru", email: "lgartiguru@uoc.edu", password: "1234" },
    { name: "Ana Paredes", email: "aparedes@uoc.edu", password: "1234" }
]

const cards = [
    {
        date: "12/03/2025",
        title: "Corto césped",
        description: "Persona con experiencia se ofrece para cortar césped por los alrededores del Vallés Oriental",
        autor: users[0].name,
        volunType: "Oferta",
        email: users[0].email
    },
    {
        date: "10/03/2025",
        title: "Ayudo en limpieza de hogar",
        description: "Persona se ofrece para limpieza de hogar a personas mayores, seriedad.",
        autor: users[1].name,
        volunType: "Oferta",
        email: users[1].email
    },
    {
        date: "11/03/2025",
        title: "Acompañamiento en estudios",
        description: "Se requiere persona con conocimiento en matemáticas para apoyo a estudiante de 12 años",
        autor: users[2].name,
        volunType: "Petición",
        email: users[2].email
    },
    {
        date: "10/03/2025",
        title: "Cuidado persona mayor",
        description: "Se necesita persona para cuidado de persona mayor el próximo lunes por la mañana.",
        autor: users[3].name,
        volunType: "Petición",
        email: users[3].email
    },
    {
        date: "14/03/2025",
        title: "Informática y tercera edad",
        description: "Ayudo a personas mayores en la iniciación con la informática (manejo de ordenador, ofimática, etc.), los jueves por la tarde",
        autor: users[2].name,
        volunType: "Oferta",
        email: users[2].email
    },
    {
        date: "13/03/2025",
        title: "Reformas",
        description: "Se busca gente para ayuda en reformas. Necesitamos tumbar 4 muros.",
        autor: users[2].name,
        volunType: "Petición",
        email: users[2].email
    }
]

// exportamos los 2 arrays
export { users, cards }