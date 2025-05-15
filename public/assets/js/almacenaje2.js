import { graphqlRequest } from "./graphClient.js"

//Mostrar el usuario activo
export function showActiveUser() {
  const domUserLogged = document.getElementById("activeUser");
  const user = localStorage.getItem("activeUser")

  if (user) {
    domUserLogged.textContent = user;
  } else {
    domUserLogged.textContent = "-no login-";
  }
}

//Autenticar usuario
export async function loginUser(event) {
  event.preventDefault();

  const domInputEmail = document.getElementById("loginInputEmail");
  const domInputPassword = document.getElementById("loginInputPassword");

  const email = domInputEmail.value;
  const password = domInputPassword.value;

  if (!email || !password) {
    alert("Por favor, completa ambos campos.");
    return;
  }

  const query = `
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        token
      }
    }
  `;

  const variables = { email, password };

  try {
    const data = await graphqlRequest(query, variables);
    const token = data.login.token;

    // Guardamos el token en localStorage
    localStorage.setItem("token", token);

    // Opcional: llamamos a currentUser para guardar el usuario completo
    const currentUser = await getCurrentUser(token);

    if (!currentUser || !currentUser.email) {
      alert("Error: no se pudo obtener el usuario actual");
      return;
    }

    localStorage.setItem("activeUser", JSON.stringify(currentUser.email));

    alert("Inicio de sesión exitoso");

    window.location.reload();
    showActiveUser();

  } catch (error) {
    alert("Error al iniciar sesión: " + error.message);
    console.error("Login error:", error);
  }
}

//Obtiene el usuario activo
async function getCurrentUser(token) {
  const query = `
    query {
      currentUser {
        name
        email
        role
      }
    }
  `;

  const data = await graphqlRequest(query, {}, token);

  if (!data || !data.currentUser) {
    throw new Error("No se pudo obtener el usuario actual");
  }

  return data.currentUser;
}

//Mostrar registros de "users" en una tabla
export async function showUsersTable() {
  const table = document.getElementById("userTableId");
  const token = localStorage.getItem("token"); // Hay que guardarlo en localStorage al hacer el login

  table.innerHTML = `
    <tr>
        <th scope="col">Nombre</th>
        <th scope="col">Email</th>
        <th scope="col">Password</th>
        <th scope="col">Rol</th>
        <th scope="col">Acciones</th>
    </tr>
  `;

  const query = `
    query {
      getUsers {
        name
        email
        password
        role
      }
    }
  `;

  try {
    const data = await graphqlRequest(query, {}, token);
    const users = data.getUsers;

    for (let user of users) {
      addUserRow(user);
    }
  } catch (error) {
    console.error("No se pudieron cargar los usuarios:", error);
  }
}

//Añadir filas en una tabla
function addUserRow(user) {
  const table = document.getElementById("userTableId")
  let newRow = table.insertRow()
  let cell1 = newRow.insertCell(0)
  let cell2 = newRow.insertCell(1)
  let cell3 = newRow.insertCell(2)
  let cell4 = newRow.insertCell(3)
  let cell5 = newRow.insertCell(4)

  cell1.textContent = user.name
  cell2.textContent = user.email
  cell3.textContent = user.password.slice(0, 8) + '...'
  cell4.textContent = user.role
  cell5.innerHTML = `<button type="button" class="btn btn-danger delete-button" data-email="${user.email}">Eliminar</button>`
}

//Añadir un nuevo usuario
export async function addNewUser(event) {
  event.preventDefault();

  const userName = document.getElementById("userNameId").value;
  const userEmail = document.getElementById("userEmailId").value;
  const userPassword = document.getElementById("userPasswordId").value;

  if (!userName || !userEmail || !userPassword) {
    alert("Por favor, rellena todos los campos.");
    return;
  }

  const query = `
    mutation CreateUser($name: String!, $email: String!, $password: String!) {
      createUser(input: { name: $name, email: $email, password: $password })
    }
  `;

  const variables = {
    name: userName,
    email: userEmail,
    password: userPassword
  };

  const token = localStorage.getItem("token");

  try {
    await graphqlRequest(query, variables, token);

    alert("Usuario creado correctamente");

    showUsersTable();

    document.getElementById("userNameId").value = "";
    document.getElementById("userEmailId").value = "";
    document.getElementById("userPasswordId").value = "";

  } catch (error) {
    alert("Error al crear el usuario: " + error.message);
  }
}
