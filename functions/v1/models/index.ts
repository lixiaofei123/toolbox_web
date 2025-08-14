export async function onRequest({ }) {
  const responseData = {
    "data": [
      {
        "id": "hunyuan-a13b",
        "object": "model",
        "owned_by": ""
      }
    ],
    "object": "list"
  };

  return new Response(JSON.stringify(responseData), {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*'
    },
  });
}
