# 多阶段构建 Dockerfile
# 第一阶段：构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 第二阶段：生产阶段
FROM node:18-alpine AS production

# 安装 http-server
RUN npm install http-server -g

# 从构建阶段复制构建产物
COPY --from=builder /app/out /html

# 设置工作目录
WORKDIR /html 

# 暴露端口
EXPOSE 8080

# 启动 nginx
CMD ["http-server", "."]
