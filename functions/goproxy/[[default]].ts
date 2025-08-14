
const go_proxy_upstream = "https://proxy.golang.org"
const prefix = "/goproxy/";

export async function onRequest({ request }) {

    const srcurl = request.url;
    const { pathname } = new URL(srcurl);
    const subpath = pathname.slice(prefix.length)

    if (subpath.startsWith("sumdb")) {
        const sumdbPath = subpath.replace("sumdb/", "");
        if(sumdbPath.endsWith("/supported")){
            return new Response("ok")
        }
        const response = await fetch(`https://${sumdbPath}`);
        return response
    } else {
        const response = await fetch(`${go_proxy_upstream}/${subpath}`);

        if (response.status !== 200) {
            return response;
        }

        // 生成可读端与可写端
        const { readable, writable } = new TransformStream();
        // 流式响应客户端
        response.body.pipeTo(writable);
        return new Response(readable, response);
    }


}
