export async function onRequest({ }) {
  const responseData = {
    "data": [
      {
        "id": "hunyuan-t1-20250822",
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
