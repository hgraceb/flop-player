@echo off & setlocal enabledelayedexpansion

for %%a in (*.avf) do (
   set str=%%a
   set var=!str:~0,-4!
   parser_avf.exe.flop "%%a" echo > !var!.rawvf
)

for %%a in (*.fsvf) do (
   set str=%%a
   set var=!str:~0,-5!
   parser_fsvf.exe.flop "%%a" echo > !var!.rawvf
)

for %%a in (*.mvf) do (
   set str=%%a
   set var=!str:~0,-4!
   parser_mvf.exe.flop "%%a" > !var!.rawvf
)

for %%a in (*.mvr) do (
   set str=%%a
   set var=!str:~0,-4!
   parser_mvr.exe.flop "%%a" > !var!.rawvf
)

for %%a in (*.rmv) do (
   set str=%%a
   set var=!str:~0,-4!
   parser_rmv.exe.flop "%%a" > !var!.rawvf
)

for %%a in (*.umf) do (
   set str=%%a
   set var=!str:~0,-4!
   parser_umf.exe.flop "%%a" > !var!.rawvf
)

for %%a in (*.rawvf.rawvf) do (
   del /f /q "%%a"
)

for %%a in (*.rawvf) do (
   set str=%%a
   set var=!str:~0,-6!
   parser_raw.exe.flop "%%a" > !var!.rawvf.rawvf
)

exit