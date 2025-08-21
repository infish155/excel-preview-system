# Excel & CSV 高性能预览系统 (Excel & CSV High-Performance Preview System)

这是一个全栈 Web 应用项目，旨在提供一个高性能、用户友好的解决方案，用于上传、解析和预览大型表格文件（`.xlsx`, `.xls`, `.csv`）。项目采用 FastAPI 内置的后台任务功能进行异步处理，为用户提供即时反馈和流畅的浏览体验，且无需 Redis 或 Celery 等外部依赖。

---

## ✨ 核心功能 (Features)

- **轻量级异步处理**: 使用 FastAPI 内置的 `BackgroundTasks`，将耗时的文件解析任务放到后台线程中执行，主 API 服务可以瞬间响应用户上传，极大提升了用户体验。
- **任务状态轮询**: 前端在提交文件后，会通过轮询机制实时获取后台任务的处理状态（处理中、成功、失败）。
- **高性能渲染**: 前端使用 `react-window` 和 `react-window-infinite-loader` 实现**虚拟化滚动**和**无限加载**，即使面对超大文件也能保持界面流畅，不卡顿。
- **支持多种格式**: 后端使用强大的 `pandas` 库，能够智能解析 `.xlsx`, `.xls`, 和 `.csv` 等多种主流表格文件格式。
- **多工作表 (Multi-Sheet) 支持**: 自动检测并解析 Excel 文件中的所有工作表，用户可以通过 Tabs 在前端轻松切换预览。
- **后端分页加载**: 采用“后端完整解析 + 前端分页请求”的架构，有效解决了大数据量下一次性传输导致的前端内存溢出问题。
- **现代化技术栈**:
    - **前端**: React (Vite) + TypeScript + Tailwind CSS
    - **后端**: FastAPI (Python)
    - **容器化**: 使用 Docker 和 Docker Compose 进行完整的环境隔离和一键部署。

---

## 🚀 快速开始 (Getting Started)

### 先决条件 (Prerequisites)

- [Docker](https://www.docker.com/products/docker-desktop/)
- Docker Compose

### 安装与启动 (Installation & Launch)

1.  **克隆仓库**
    ```bash
    git clone <your-repository-url>
    cd excel-preview-system
    ```

2.  **构建并启动所有服务**
    在项目根目录下运行以下命令。该命令会启动 FastAPI 服务器和 React 开发服务器。
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
2.  **任务分发**: FastAPI 接收到文件后，使用 `BackgroundTasks` 将耗时的解析函数注册为一个后台任务。然后**立即**返回一个 `jobId` 给前端。
3.  **后台处理**: 解析任务在 FastAPI 进程的后台线程中执行。任务状态和解析结果都存储在 FastAPI 进程的**内存缓存**中。
4.  **状态轮询**: 前端拿到 `jobId` 后，会每隔几秒钟向 `GET /api/jobs/{jobId}/status` 接口发送请求，查询任务的实时状态。
5.  **获取数据**: 前端轮询到成功状态后，开始通过 `GET /api/data/{dataId}/{sheetName}` 接口，从内存缓存中分页获取并展示数据。

---
