# Excel & CSV 预览系统 (Excel & CSV Preview System)

这是一个全栈 Web 应用项目，旨在提供一个高性能、用户友好的解决方案，用于上传、解析和预览表格文件（`.xlsx`, `.xls`, `.csv`）。即使文件包含数十万行数据，前端也能通过虚拟化滚动和分页加载技术，提供流畅的浏览体验。

---

## ✨ 核心功能 (Features)

- **高性能渲染**: 前端使用 `react-window` 和 `react-window-infinite-loader` 实现**虚拟化滚动**和**无限加载**，即使面对超大文件也能保持界面流畅，不卡顿。
- **支持多种格式**: 后端使用 `pandas` 库，能够智能解析 `.xlsx`, `.xls`, 和 `.csv` 等多种主流表格文件格式。
- **多工作表 (Multi-Sheet) 支持**: 自动检测并解析 Excel 文件中的所有工作表，用户可以通过 Tabs 在前端轻松切换预览。
- **后端分页加载**: 采用“后端完整解析 + 前端分页请求”的架构，有效解决了大数据量下一次性传输导致的前端内存溢出问题。
- **现代化技术栈**:
    - **前端**: React (Vite) + TypeScript + Tailwind CSS
    - **后端**: FastAPI (Python)
    - **容器化**: 使用 Docker 和 Docker Compose 进行完整的环境隔离和一键部署。
- **动态列宽计算**: 前端会根据表头和内容的长度，智能估算并设置合适的列宽，提升可读性。

---

## 🚀 快速开始 (Getting Started)

本项目已完全容器化，你只需要安装 Docker 即可在任何操作系统上轻松运行。

### 先决条件 (Prerequisites)

- [Docker](https://www.docker.com/products/docker-desktop/) (v20.10.0 或更高版本)
- Docker Compose (通常随 Docker Desktop 一同安装)

### 安装与启动 (Installation & Launch)

1.  **克隆仓库**
    ```bash
    git clone https://github.com/infish155/excel-preview-system
    cd excel-preview-system
    ```

2.  **构建并启动所有服务**
    在项目根目录下（即 `docker-compose.yml` 文件所在的目录），运行以下命令：
    ```bash
    docker compose up --build
    ```
    - `up`: 启动所有在 `docker-compose.yml` 中定义的服务。
    - `--build`: 强制重新构建镜像。当你修改了依赖（如 `package.json` 或 `requirements.txt`）或 `Dockerfile` 时，需要使用此参数。

3.  **访问应用**
    - **前端应用**: 打开浏览器并访问 `http://localhost:5173`
    - **后端 API**: API 服务运行在 `http://localhost:8000` (API 文档地址: `http://localhost:8000/docs`)

---

## 🏛️ 项目架构 (Architecture)

本项目采用前后端分离的架构，并通过 Docker Compose 进行编排。

- **`frontend` (React)**:
    - 负责所有用户界面和交互。
    - 使用 Vite 作为构建工具，提供极速的开发体验。
    - 通过 REST API 与后端通信，上传文件并分页获取数据。
- **`backend` (FastAPI)**:
    - 负责处理文件上传、解析和数据缓存。
    - 提供两个核心 API 端点：
        1.  `POST /api/upload`: 接收文件，使用 `pandas` 解析，将数据存入内存缓存，并返回一个唯一的 `dataId` 和元数据。
        2.  `GET /api/data/{dataId}/{sheetName}`: 根据 `dataId` 和工作表名称，提供分页后的数据。
- **`Docker`**:
    - `Dockerfile`: 分别定义了前端和后端服务的构建规则。前端 `Dockerfile` 使用多阶段构建，生成一个轻量的、基于 Nginx 的生产镜像。
    - `docker-compose.yml`: 作为项目的总指挥，负责一键构建、启动和连接所有服务。

---

## 💡 未来可改进方向 (Future Improvements)

- **使用 Redis 缓存**: 将后端的内存缓存替换为 Redis，以支持数据持久化和多实例部署。
- **实现流式处理 (WebSocket)**: 对于超大 CSV 文件，可以探索使用 WebSocket 实现后端流式解析和前端实时追加数据，提供极致的即时反馈体验。
- **单元测试与集成测试**: 为前后端关键模块编写测试用例，保证代码质量。
- **优化列宽计算**: 引入更精确的 Canvas `measureText` API 来计算列宽，而不是基于平均字符宽度的估算。
