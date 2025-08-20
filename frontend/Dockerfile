# --- Stage 1: Build ---
# 使用一个包含完整 Node.js 环境的镜像来构建项目
FROM node:20-alpine as builder

# 设置工作目录
WORKDIR /app

# 拷贝 package.json 和 lock 文件
# 如果你最终使用的是 yarn，请拷贝 yarn.lock
COPY package.json package-lock.json ./

# 安装依赖。使用 npm ci 可以实现更快的、确定性的安装
# 如果你最终使用的是 yarn，请使用 `RUN yarn install --frozen-lockfile`
RUN npm ci

# 拷贝所有源代码
COPY . .

# 运行构建命令，生成静态文件到 /app/dist 目录
RUN npm run build

# --- Stage 2: Production ---
# 使用一个非常轻量的 Nginx 镜像来托管静态文件
FROM nginx:1.25-alpine

# 从 'builder' 阶段拷贝编译好的静态文件到 Nginx 的 Web 根目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 拷贝自定义的 Nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]