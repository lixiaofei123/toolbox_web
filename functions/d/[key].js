export async function onRequest({ request, params }) {
    const key = params.key

    let value = await dwz.get(key, "json");
    if (value === null) {
        return Response(JSON.stringify({ data: '短网址不存在' }), { status: 400 });
    }

    if (value.hip === false) {
        return Response("", {
            status: 301, headers: {
                'Location': value.url
            }
        })
    } else {
        return Response(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>正在跳转...</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f9f9f9;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      color: #333;
    }

    .card {
      text-align: center;
      background: #fff;
      padding: 40px 60px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      max-width: 500px;
    }

    h1 {
      font-size: 22px;
      margin-bottom: 15px;
    }

    .url {
      font-size: 16px;
      color: #0073e6;
      word-break: break-all;
      margin-bottom: 20px;
    }

    a {
      display: inline-block;
      padding: 10px 20px;
      background: #0073e6;
      color: #fff;
      font-weight: bold;
      text-decoration: none;
      border-radius: 6px;
      transition: background 0.2s;
    }

    a:hover {
      background: #005bb5;
    }

    .countdown {
      margin-top: 15px;
      font-size: 14px;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>正在跳转到目标页面</h1>
    <div class="url" id="targetUrl">${value.url}</div>
    <a id="link" href="${value.url}">立即前往</a>
    <div class="countdown">
      将在 <span id="timer">5</span> 秒后自动跳转
    </div>
  </div>

  <script>
    const targetUrl = "${value.url}";
    let timeLeft = 5;
    const timerEl = document.getElementById("timer");
    const linkEl = document.getElementById("link");
    const urlEl = document.getElementById("targetUrl");

    urlEl.textContent = targetUrl;
    linkEl.href = targetUrl;

    const countdown = setInterval(() => {
      timeLeft--;
      timerEl.textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(countdown);
        window.location.href = targetUrl;
      }
    }, 1000);

    linkEl.addEventListener("click", () => {
      clearInterval(countdown);
      window.location.href = targetUrl;
    });
  </script>
</body>
</html>
`,{
    headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
    }
})
    }

}