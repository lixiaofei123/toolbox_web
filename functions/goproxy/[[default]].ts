const go_proxy_upstream = "https://proxy.golang.org"
const sumdb_url = "https://sum.golang.org"
const prefix = "/goproxy/";

export async function onRequest({ request }) {
    const srcurl = request.url;
    const { pathname } = new URL(srcurl);
    
    // 检查路径是否以prefix开头
    if (!pathname.startsWith(prefix)) {
        return new Response("Invalid path", { status: 400 });
    }
    
    const subpath = pathname.slice(prefix.length);

    if (subpath.startsWith("sumdb/")) {
        // 修复sumdb路径处理
        const sumdbPath = subpath.replace("sumdb/", "");
        
        // 对于sumdb请求，需要保持原始格式，只转发必要的headers
        const headers = new Headers();
        headers.set('User-Agent', 'Go-http-client/1.1');
        
        // 只转发Accept相关headers
        const acceptHeader = request.headers.get('Accept');
        if (acceptHeader) {
            headers.set('Accept', acceptHeader);
        }
        
        const response = await fetch(`${sumdb_url}/${sumdbPath}`, {
            method: request.method,
            headers: headers
        });
        
        // 直接返回原始响应，不修改headers
        return response;
    } else {
        const response = await fetch(`${go_proxy_upstream}/${subpath}`, {
            method: request.method,
            headers: {
                ...Object.fromEntries(request.headers.entries()),
                'User-Agent': 'Go-http-client/1.1'
            }
        });

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
