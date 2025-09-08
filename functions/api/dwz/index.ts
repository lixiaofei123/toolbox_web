function generateRandomString(length: number = 6): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }
    return result;
}


// 创建新的短网址
export async function onRequestPut({ request, params, env }) {
    try {
        const body = request.json()
        const url = body.url
        const password = body.password
        const length = body.length || 6
        if (env.password) {
            if (env.password !== password) {
                return new Response(JSON.stringify({ data: '密码错误' }), {
                    status: 401,
                    headers: {
                        'content-type': 'application/json; charset=UTF-8',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }
        }

        let key = generateRandomString(length)
        while (true) {
            let value = await dwz.get(key);
            if (value === null) {
                await dwz.put(key, url);
                break
            }
            key = generateRandomString(length)
        }

        return new Response(JSON.stringify({ data: key }), {
            headers: {
                'content-type': 'application/json; charset=UTF-8',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error: unknown) {
        let message = error
        if (error instanceof Error) {
            message = error.message
        }
            
         return new Response(JSON.stringify({ data: message }), {
            status: 504,
            headers: {
                'content-type': 'application/json; charset=UTF-8',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}


// 删除短网址
export async function onRequestDelete({ request, params, env }) {
    const body = request.json()
    const password = body.password
    const key = body.key
    if (env.password) {
        if (password !== password) {
            return new Response(JSON.stringify({ data: '密码错误' }), {
                status: 401,
                headers: {
                    'content-type': 'application/json; charset=UTF-8',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }
    }

    return new Response(JSON.stringify({ data: 'ok' }), {
        headers: {
            'content-type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
        },
    });

}