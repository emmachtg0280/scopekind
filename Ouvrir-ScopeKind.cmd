@echo off
setlocal
set "SCOPEKIND_EDITOR=%~dp0.sites-runtime\vscode\Code.exe"
if exist "%SCOPEKIND_EDITOR%" (
  start "" "%SCOPEKIND_EDITOR%" --new-window "%~dp0ScopeKind.code-workspace"
  exit /b 0
)
where code >nul 2>nul
if not errorlevel 1 (
  call code "%~dp0ScopeKind.code-workspace"
  exit /b 0
)
echo Install Visual Studio Code, then open ScopeKind.code-workspace.
pause
