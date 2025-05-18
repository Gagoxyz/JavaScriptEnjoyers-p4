// public/js/graphqlClient.js
export const graphqlRequest = async (query, variables = {}, token = "") => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch("https://pd48ct-3000.csb.app/graphql", {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();

  if (result.errors) {
    console.error("GraphQL Errors:", JSON.stringify(result.errors, null, 2));
    throw new Error(result.errors[0].message || "Error en la petición GraphQL");
  }

  return result.data;
};
