// 代码参考自 https://github.com/ciiiii/cloudflare-docker-proxy/blob/master/src/index.js


const dockerHubUrl = "https://registry-1.docker.io";

export async function onRequest({ request}) {
    const url = new URL(request.url);

    const authorization = request.headers.get("Authorization");
    if (url.pathname == "/v2/") {
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

    if (url.pathname == "/v2/auth") {
        const newUrl = new URL(dockerHubUrl + "/v2/");
        const resp = await fetch(newUrl.toString(), {
            method: "GET",
            redirect: "follow",
        });
        if (resp.status !== 401) {
            return resp;
        }
        const authenticateStr = resp.headers.get("WWW-Authenticate");
        if (authenticateStr === null) {
            return resp;
        }
        const wwwAuthenticate = parseAuthenticate(authenticateStr);
        let scope = url.searchParams.get("scope");
        // autocomplete repo part into scope for DockerHub library images
        // Example: repository:busybox:pull => repository:library/busybox:pull
        if (scope) {
            let scopeParts = scope.split(":");
            if (scopeParts.length == 3 && !scopeParts[1].includes("/")) {
                scopeParts[1] = "library/" + scopeParts[1];
                scope = scopeParts.join(":");
            }
        }
        return await fetchToken(wwwAuthenticate, scope, authorization);
    }

    // redirect for DockerHub library images
    // Example: /v2/busybox/manifests/latest => /v2/library/busybox/manifests/latest
    const pathParts = url.pathname.split("/");
    if (pathParts.length == 5) {
        pathParts.splice(2, 0, "library");
        const redirectUrl = new URL(url);
        redirectUrl.pathname = pathParts.join("/");
        return Response.redirect(redirectUrl, 301);
    }

    const newUrl = new URL(dockerHubUrl + url.pathname);
    const newReq = new Request(newUrl, {
        method: request.method,
        headers: request.headers,
        redirect: "manual",
    });

    if(url.pathname.indexOf("/blobs/") !== -1){
        // 对于blob，优先从Cache中获取
        const cache = caches.default;
        try{
            let response = await cache.match(newReq);
            return response
        }catch (e) {
            await cache.delete(request);
        }
    }

    let resp = await fetch(newReq);
    if (resp.status == 401) {
        return responseUnauthorized(url);
    }

    if(resp.status == 503){
        return new Response(newReq.toString(), {
            status: 200,
            headers: resp.headers,
        })
    }

    if (resp.status == 307) {
        const location = new URL(resp.headers.get("Location"));
        const redirectResp = await fetch(location.toString(), {
            method: "GET",
            redirect: "follow",
        });
        return redirectResp;
    }

    if(url.pathname.indexOf("/blobs/") !== -1){
        const cache = caches.default;
        resp.headers.append('x-edgefunctions-cache', 'hit');
        cache.put(request, resp.clone());
        resp.headers.set('x-edgefunctions-cache', 'miss');
    }

    return resp

}


async function fetchToken(wwwAuthenticate, scope, authorization) {
  const url = new URL(wwwAuthenticate.realm);
  if (wwwAuthenticate.service.length) {
    url.searchParams.set("service", wwwAuthenticate.service);
  }
  if (scope) {
    url.searchParams.set("scope", scope);
  }
  const headers = new Headers();
  if (authorization) {
    headers.set("Authorization", authorization);
  }
  return await fetch(url, { method: "GET", headers: headers });
}

function parseAuthenticate(authenticateStr) {
  // sample: Bearer realm="https://auth.ipv6.docker.com/token",service="registry.docker.io"
  // match strings after =" and before "
  const re = /(?<=\=")(?:\\.|[^"\\])*(?=")/g;
  const matches = authenticateStr.match(re);
  if (matches == null || matches.length < 2) {
    throw new Error(`invalid Www-Authenticate Header: ${authenticateStr}`);
  }
  return {
    realm: matches[0],
    service: matches[1],
  };
}

function responseUnauthorized(url) {
    const headers = new Headers();
    headers.set(
        "Www-Authenticate",
        `Bearer realm="https://${url.hostname}/v2/auth",service="cloudflare-docker-proxy"`
    );
    return new Response(JSON.stringify({ message: "UNAUTHORIZED" }), {
        status: 401,
        headers: headers,
    });
}
