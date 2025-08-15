
const prefix = "/cdn/";

export async function onRequest({ request }) {

    const srcurl = request.url;
    const { pathname } = new URL(srcurl);
    const subpath = pathname.slice(prefix.length)

    let proxy_url = ""
    if (subpath.startsWith("gh/") || subpath.startsWith("npm/") || subpath.startsWith("wp/")) {
        proxy_url = `https://cdn.jsdelivr.net/${subpath}`
    }

    if (subpath.startsWith("cnb/")) {
        proxy_url = convertCnbPath(subpath)
    }

    if (subpath.startsWith("http://") || subpath.startsWith("https://")) {
        proxy_url = subpath
    }

    if (proxy_url !== "") {
        const data_request = new Request(proxy_url)
        const cache = caches.default;
        try {
            let response = await cache.match(data_request);
            if (!response) {
                return fetchData(data_request);
            }
            response.headers.append('x-edgefunctions-cache', 'hit');
            return response;
        } catch (e) {
            await cache.delete(request);
            return fetchData(data_request);
        }
    }

    return new Response("", { status: 404})

}

async function fetchData(request) {

    const cache = caches.default;
    let response = await fetch(request);
    response.headers.append('Cache-Control', 's-maxage=60');
    response.headers.delete('access-control-allow-origin')
    response.headers.append('access-control-allow-origin', '*')
    cache.put(request, response.clone());
    response.headers.append('x-edgefunctions-cache', 'miss');
    return response;
    
}


function convertCnbPath(subpath: string) {
    const rest = subpath.slice(4);
    const parts = rest.split("/");
    if (parts.length < 2) {
        return "";
    }
    const username = parts[0];
    const [pkg, version] = parts[1].split("@");
    const filePath = parts.slice(2).join("/");
    if (!pkg || !version || !filePath) {
        return "";
    }
    return `https://cnb.cool/${username}/${pkg}/-/git/raw/${version}/${filePath}`;
}