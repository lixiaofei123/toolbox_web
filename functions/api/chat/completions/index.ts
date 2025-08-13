async function onRequest({ request }) {

    const browserLikeHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) ' +
            'Chrome/115.0.0.0 Safari/537.36',
        'Origin': 'https://cnb.cool',
        'Referer': 'https://cnb.cool/'
    };

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Max-Age': '86400'
    };

    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: corsHeaders
        });
    }

    const body = await request.json()

    const upstreamResponse = await fetch('https://cnb.cool/ai/chat/completions', {
        method: 'POST',
        headers: browserLikeHeaders,
        body: JSON.stringify(body)
    });


    if (body.stream === true) {
        // 流式响应
        const { readable, writable } = new TransformStream();
        upstreamResponse.body.pipeTo(writable);
        return new Response(readable, {
            status: upstreamResponse.status,
            headers: {
                ...Object.fromEntries(upstreamResponse.headers),
                ...corsHeaders
            }
        });
    } else {
        // 非流式响应
        const text = await upstreamResponse.text();
        return new Response(text, {
            status: upstreamResponse.status,
            headers: {
                ...Object.fromEntries(upstreamResponse.headers),
                ...corsHeaders
            }
        });
    }
}

