#!/bin/bash

# 构建脚本
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目信息
PROJECT_NAME="base64-converter"
VERSION=${1:-latest}
REGISTRY=${2:-""}

echo -e "${BLUE}🚀 开始构建 ${PROJECT_NAME}:${VERSION}${NC}"

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker 未运行，请先启动 Docker${NC}"
    exit 1
fi

# 清理旧的构���缓存
echo -e "${YELLOW}🧹 清理构建缓存...${NC}"
docker builder prune -f

# 构建镜像
echo -e "${YELLOW}🔨 构建 Docker 镜像...${NC}"
if [ -n "$REGISTRY" ]; then
    IMAGE_NAME="${REGISTRY}/${PROJECT_NAME}:${VERSION}"
else
    IMAGE_NAME="${PROJECT_NAME}:${VERSION}"
fi

docker build \
    --target production \
    --tag "${IMAGE_NAME}" \
    --build-arg NODE_ENV=production \
    .

# 检查构建结果
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 镜像构建成功: ${IMAGE_NAME}${NC}"
    
    # 显示镜像信息
    echo -e "${BLUE}📊 镜像信息:${NC}"
    docker images "${IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
    
    # 询问是否运行容器
    read -p "是否立即运行容器? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🚀 启动容器...${NC}"
        
        # 停止并删除已存在的容器
        docker stop "${PROJECT_NAME}" 2>/dev/null || true
        docker rm "${PROJECT_NAME}" 2>/dev/null || true
        
        # 运行新容器
        docker run -d \
            --name "${PROJECT_NAME}" \
            --port 3000:80 \
            --restart unless-stopped \
            "${IMAGE_NAME}"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ 容器启动成功${NC}"
            echo -e "${BLUE}🌐 访问地址: http://localhost:3000${NC}"
            echo -e "${BLUE}🏥 健康检查: http://localhost:3000/health${NC}"
        else
            echo -e "${RED}❌ 容器启动失败${NC}"
            exit 1
        fi
    fi
    
    # 询问是否推送到仓库
    if [ -n "$REGISTRY" ]; then
        read -p "是否推送到镜像仓库? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}📤 推送镜像到仓库...${NC}"
            docker push "${IMAGE_NAME}"
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ 镜像推送成功${NC}"
            else
                echo -e "${RED}❌ 镜像推送失败${NC}"
                exit 1
            fi
        fi
    fi
    
else
    echo -e "${RED}❌ 镜像构建失败${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 构建完成!${NC}"
