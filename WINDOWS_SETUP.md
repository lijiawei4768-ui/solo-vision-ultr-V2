# Solo Vision Ultra Windows Stable Setup

This project is now prepared to run natively on Windows instead of WSL.

## Recommended stable setup

- Open the project from the Windows path:
  `C:\Users\MI\Desktop\solo-vision-ultra`
- Use Windows `node` + `npm`
- Recommended Node version: `20 LTS`
- Do not run the dev server from `/mnt/c/...` inside WSL if your goal is maximum stability

## First switch back from WSL

If you previously installed dependencies or ran the project in WSL, run this once on Windows:

```bat
repair-windows-env.bat
```

That script removes generated dependency/build folders and reinstalls them with Windows Node/npm.

## Main app

Start the main app with:

```bat
start-npm.bat
```

The Windows startup script now uses a fixed local setup:

- `HOST=127.0.0.1`
- `PORT=3000`
- `BROWSER=none`
- `WDS_SOCKET_HOST=127.0.0.1`

## Standalone demo

Start the standalone launch demo with:

```bat
standalone-demo\launch\run-launch-demo.cmd
```

## If something still feels slow

- Make sure you are running from Windows Terminal, Command Prompt, or PowerShell
- Make sure the editor/workspace is opened from `C:\Users\...`, not the WSL mount path
- If needed, run `repair-windows-env.bat` again after any major environment switch
