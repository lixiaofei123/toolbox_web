// 代码参考自 https://github.com/ciiiii/cloudflare-docker-proxy/blob/master/src/index.js


const dockerHubUrl = "https://registry-1.docker.io";

export async function onRequest({ request }) {
    const url = new URL(request.url);

    const authorization = request.headers.get("Authorization");
    const newUrl = new URL(dockerHubUrl + "/v2/");
    const headers = new Headers();
    if (authorization) {
        headers.set("Authorization", authorization);
    }
    const resp = await fetch(newUrl.toString(), {
        method: "GET",
        headers: headers,
        redirect: "follow",
    });
    if (resp.status === 401) {
        return responseUnauthorized(url);
    }
    return resp;

}

function responseUnauthorized(url) {
    const headers = new Headers();
    headers.set(
        "Www-Authenticate",
        `Bearer realm="https://${url.hostname}/v2/auth",service="edgeone-page-proxy"`
    );
    return new Response(JSON.stringify({ message: "UNAUTHORIZED" }), {
        status: 401,
        headers: headers,
    });
}
