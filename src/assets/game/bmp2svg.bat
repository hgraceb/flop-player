@echo off

REM AutoTrace 可执行文件路径
set autotrace_exe=D:\Program Files (x86)\AutoTrace\autotrace.exe

REM 判断是否有 AutoTrace 可执行文件
if not exist "%autotrace_exe%" echo The executable file "%autotrace_exe%" was not found . . . & goto failure

if not exist "svg\" (
   mkdir "svg"
)

for %%a in (*.bmp) do (
   set /p=______________________________________________________________________________________________________________________<nul & echo.
   echo.
   echo input file: "%%a"
   "%autotrace_exe%" -output-format svg -output-file "svg\%%~na.svg" "%%a"
   echo ouput file: "svg\%%~na.svg"
)

REM 成功
:success
set /p=______________________________________________________________________________________________________________________<nul & echo.
TIMEOUT /T 15 /NOBREAK
goto :EOF

REM 失败
:failure
set /p=______________________________________________________________________________________________________________________<nul & echo. & echo.
set /p=Press any key to continue . . .<nul
pause >nul
goto :EOF
