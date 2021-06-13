@echo off & setlocal enabledelayedexpansion

for %%a in (*.avf) do (
   set str=%%a
   set var=!str:~0,-4!
   parser_avf "%%a" echo > !var!.rawvf
)

for %%a in (*.fsvf) do (
   set str=%%a
   set var=!str:~0,-5!
   parser_fsvf "%%a" echo > !var!.rawvf
)

for %%a in (*.mvf) do (
   set str=%%a
   set var=!str:~0,-4!
   parser_mvf "%%a" > !var!.rawvf
)

for %%a in (*.mvr) do (
   set str=%%a
   set var=!str:~0,-4!
   parser_mvr "%%a" > !var!.rawvf
)

for %%a in (*.rmv) do (
   set str=%%a
   set var=!str:~0,-4!
   parser_rmv "%%a" > !var!.rawvf
)

for %%a in (*.umf) do (
   set str=%%a
   set var=!str:~0,-4!
   parser_umf "%%a" > !var!.rawvf
)

for %%a in (*.rawvf.rawvf) do (
   del /f /q %%a
)

for %%a in (*.rawvf) do (
   set str=%%a
   set var=!str:~0,-6!
   parser_raw "%%a" > !var!.rawvf.rawvf
)

pause