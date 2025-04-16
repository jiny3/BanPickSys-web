# BanPickSys-web

> 不会前端, 小孩子不懂事写着玩的

![bp.png](./README.asset/bp.png)

![result.png](./README.asset/result.png)

## 项目介绍

这是一个为星铁 - 豹豹碰碰大作战设计的 BP 系统前端, 该应用允许玩家在计时环境中轮流禁用和选择角色

## 功能特点

- **双方对战**：蓝方（玩家1）和红方（玩家2）
- **角色选择**：按回合顺序进行ban和pick (具体规则取决于后端)
- **阶段计时**：显示当前阶段和剩余时间
- **结果展示**：在游戏结束时显示最终选择

## 使用方法

参考 `BanPickSys` 使用方法

## API接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/bp` | GET | 启动一场新 bp |
| `/bp/{bpID}` | GET | 进入指定 bp 场次 |
| `/bp/{bpID}/status` | GET | 获取当前bp状态 |
| `/bp/{bpID}/entries` | GET | 获取可选角色列表 |
| `/bp/{bpID}/result` | GET | 获取bp结果 |
| `/bp/{bpID}/submit` | POST | 选择角色 |
| `/bp/{bpID}/join` | POST | 加入指定 bp 场次 |
| `/bp/{bpID}/leave` | POST | 离开指定 bp 场次 |

## 文件结构
```bash
BanPickSys-web
├── img         # 图像资源
│   ├── 刺头海豹.png
│   ├── ...
│   └── 黑化海豹.png
├── index.html
├── js          # JavaScript文件
│   ├── api.js
│   ├── display.js
│   └── ws.js
└── style.css
```

## 注意事项

本项目为前端部分，需要配合后端项目 `BanPickSys` 才能正常运行。