# Excel & CSV 预览系统 (Excel & CSV High-Performance Preview System)

这是一个全栈 Web 应用项目，旨在提供一个高性能、用户友好的解决方案，用于上传、解析和预览大型表格文件（`.xlsx`, `.xls`, `.csv`）。项目采用异步处理架构，能够优雅地处理耗时的文件解析任务，为用户提供即时反馈和流畅的浏览体验。

---

## ✨ 核心功能 (Features)

- **异步后台处理**: 引入 **Celery** 和 **Redis**，将耗时的文件解析任务放到后台工作进程中执行，主 API 服务可以瞬间响应用户上传，极大提升了用户体验。
- **任务状态轮询**: 前端在提交文件后，会通过轮询机制实时获取后台任务的处理状态（处理中、成功、失败）。
- **高性能渲染**: 前端使用 `react-window` 和 `react-window-infinite-loader` 实现**虚拟化滚动**和**无限加载**，即使面对超大文件也能保持界面流畅，不卡顿。
- **支持多种格式**: 后端使用强大的 `pandas` 库，能够智能解析 `.xlsx`, `.xls`, 和 `.csv` 等多种主流表格文件格式。
- **多工作表 (Multi-Sheet) 支持**: 自动检测并解析 Excel 文件中的所有工作表，用户可以通过 Tabs 在前端轻松切换预览。
- **后端分页加载**: 采用“后端完整解析 + 前端分页请求”的架构，有效解决了大数据量下一次性传输导致的前端内存溢出问题。
- **现代化技术栈**:
    - **前端**: React (Vite) + TypeScript + Tailwind CSS
    - **后端**: FastAPI (Python) + Celery
    - **中间件**: Redis (用作 Celery 的消息代理和数据缓存)
    - **容器化**: 使用 Docker 和 Docker Compose 进行完整的环境隔离和一键部署。

---

## 🚀 快速开始 (Getting Started)

### 先决条件 (Prerequisites)

- [Docker](https://www.docker.com/products/docker-desktop/)
- Docker Compose

### 安装与启动 (Installation & Launch)

1.  **克隆仓库**
    ```bash
    git clone https://github.com/infish155/excel-preview-system.git
    cd excel-preview-system
    ```

2.  **构建并启动所有服务**
    在项目根目录下运行以下命令。该命令会一次性启动 FastAPI 服务器、React 开发服务器、Redis 实例和一个 Celery 工作进程。
    ```bash
    docker compose up --build
    ```

3.  **访问应用**
    - **前端应用**: `http://localhost:5173`
    - **后端 API 文档**: `http://localhost:8000/docs`

---

## 🏛️ 项目架构 (Architecture)

本项目采用前后端分离的异步处理架构：

1.  **文件上传**: 用户在前端选择文件，通过 `POST /api/upload` 发送给 FastAPI 后端。
2.  **任务分发**: FastAPI 接收到文件后，**不进行解析**。它立刻创建一个解析任务，并将任务信息（文件名、文件内容）发送到 **Redis** 消息队列中，然后**立即**返回一个 `jobId` 给前端。
3.  **后台处理**: **Celery Worker** 进程持续监听 Redis 队列。一旦发现新任务，它就会取出任务并开始在后台执行耗时的文件解析操作。
4.  **状态轮询**: 前端拿到 `jobId` 后，会每隔几秒钟向 `GET /api/jobs/{jobId}/status` 接口发送请求，查询任务的实时状态。
5.  **存储结果**: Celery Worker 解析完成后，会将最终的数据（或元数据）存入 **Redis 缓存**中，并更新任务状态为“成功”。
6.  **获取数据**: 前端轮询到成功状态后，开始通过 `GET /api/data/{dataId}/{sheetName}` 接口，从 Redis 缓存中分页获取并展示数据。

![应用架构图](https://i.imgur.com/gK2IBd7.png)

---

## 📁 项目结构 (Project Structure)

```
excel-preview-system/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints/
│   │   │       ├── upload.py   # 上传接口 (分发任务)
│   │   │       ├── jobs.py     # 任务状态查询接口
│   │   │       └── data.py     # 分页数据获取接口
│   │   ├── celery_app.py # Celery 应用配置
│   │   ├── tasks.py      # Celery 后台任务定义
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── PaginatedVirtualizedTable.tsx # 分页虚拟化表格
│   │   └── ...
│   └── ...
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## 💡 未来可改进方向 (Future Improvements)

- **WebSocket 实时推送**: 将前端的状态轮询机制升级为 WebSocket，由后端在任务状态变更时主动推送消息，实现更高效的实时通信。
- **单元测试与集成测试**: 为前后端关键模块编写测试用例。
- **可配置的缓存过期时间**: 允许通过环境变量配置 Redis 缓存的过期时间。
