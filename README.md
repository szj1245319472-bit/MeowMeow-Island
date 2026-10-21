# MeowMeow Island · ATARO Portfolio

沈智键的交互式 3D 作品集：低模雨夜工作台、小猫与四类视觉作品。支持中英文切换，以及书籍、电影、音乐和游戏收藏展示。

This is a static, bilingual 3D portfolio. All runtime assets are included in this repository; no build step or external CDN is required.

## 本地预览

在仓库根目录运行 `python -m http.server 8765 --bind 127.0.0.1`，然后打开 `http://127.0.0.1:8765/`。请使用 HTTP 服务，不要直接打开本地 `index.html` 文件。

## GitHub Pages

将仓库的 `main` 分支根目录设为 Pages 发布源：`Settings → Pages → Build and deployment → Deploy from a branch → main → /(root)`。发布后，项目页面地址应为 `https://szj1245319472-bit.github.io/MeowMeow-Island/`。

网站使用相对路径，可直接作为项目站点发布。`.nojekyll` 告诉 GitHub Pages 按静态文件原样发布。

网站图片为个人作品集展示素材。`vendor/` 中的 Three.js 相关代码保留其随附的许可证；第三方名称与商标归各自权利人所有。

