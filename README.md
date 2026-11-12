# 品质核查 H5

业务仓库同时提供官方统一 H5 外壳模块和保留的账号密码独立调试入口。正式移动端接入使用 `index.ts`，由 `cloud.jetlinks.mobile` 的统一外壳负责启动、项目授权、应用实例验证、会话及请求凭证。业务模块不导入本仓库的 `src/main.ts`、`Root.vue` 或登录页，不读取独立调试会话。

## 统一外壳接入

[官方移动端子应用接入手册](https://github.com/jetlinks-v2/cloud.jetlinks.mobile/blob/2.20/docs/mobile-app-modules.md) 维护通用接入流程。将本仓库以 Git Submodule 接入主工程 `modules/quality-inspection-wx-ui`；模块 ID 为 `quality-app`，真实模板编码为 `QualityInspection`，声明统一维护在 `package.json.jetlinksMobile`。

所有业务路由由模块 ID 派生，位于 `/applications/quality-app` 下；已有页面的局部路径经模块导航适配后解析为带命名空间的实际 URL。通过 `useMobileAppContext()` 消费只读项目、真实应用和官方 `request`，业务 API 只传相对路径。外壳负责项目 token、租户编码、应用 Scope 和 HTTP 错误；本模块不接触外壳凭证。预览没有真实应用时显示入口提示，不调用业务接口。

在主工程根目录执行（pnpm 版本由主工程固定）：

```sh
pnpm install
pnpm dev:app quality-app --port 5174
pnpm build:app quality-app
pnpm preview:app quality-app --port 4174
```

初次接入需更新主工程共享锁、登记部署方控制的 `VITE_MOBILE_APP_URLS`，按实际主应用配置 `H5_APP_HOST_ORIGIN` 和 HTTPS。正式产物为“统一外壳 + 本业务模块”，输出到本仓库 `dist/`。构建子目录时设置一致的 `VITE_BASE_PATH`。CI 应记录外壳版本、业务版本与共享锁版本。普通成员不需要模板管理权限；业务权限、执行资格及物业所属项目仍由业务后端核验。

外壳请求契约须支持 `DELETE` 和 `responseType: 'blob'`，附件与表单上传统一通过官方请求层；403 保留会话，401 由外壳恢复项目登录。模块卸载和上下文变化会取消请求、清除业务页面状态并拒收旧结果；写操作不自动重放。样式仅在模块挂载期间作用于业务根节点，组件局部注册。

## 保留的独立调试入口

这是保留自建登录的额外入口，不属于官方模块的运行路径。Node.js 22.18+：

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm run test:browser
```

访问 `/quality-h5/?applicationScope=<应用ID>`，只填写应用账号、密码及平台要求的安全验证；账号原样提交，不要求项目编码。运行配置只包含标题和同源 `apiBase`。独立模式维护自己的 sessionStorage，会话与外壳隔离。`?mode=app` 的历史宿主适配保留用于已有集成，官方统一外壳使用上述模块入口。

两种构建都会输出 `dist/`，部署时必须选择正确模式并保留上一版。独立构建不更新官方组合产物，PC 构建也不更新本 H5。Docker/Nginx 示例仅用于独立调试入口的部署；正式外壳组合部署遵循主工程手册。真实后端、跨域网关与原生设备能力须在实际环境联调验收。
