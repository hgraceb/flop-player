@echo off & setlocal enabledelayedexpansion

for %%a in (*.avf) do (
   set str=%%a
   set var=!str:~0,-4!
   parser_avf.flop "%%a" echo > !var!.rawvf
)

for %%a in (*.fsvf) do (
   set str=%%a
   set var=!str:~0,-5!
   parser_fsvf.flop "%%a" echo > !var!.rawvf
)

for %%a in (*.mvf) do (
   set str=%%a
   set var=!str:~0,-4!
   parser_mvf.flop "%%a" > !var!.rawvf
)

for %%a in (*.mvr) do (
   set str=%%a
   set var=!str:~0,-4!
   parser_mvr.flop "%%a" > !var!.rawvf
)

for %%a in (*.rmv) do (
   set str=%%a
   set var=!str:~0,-4!
   parser_rmv.flop "%%a" > !var!.rawvf
)

for %%a in (*.umf) do (
   set str=%%a
   set var=!str:~0,-4!
   parser_umf.flop "%%a" > !var!.rawvf
)

for %%a in (*.rawvf.rawvf) do (
   del /f /q %%a
)

for %%a in (*.rawvf) do (
   set str=%%a
   set var=!str:~0,-6!
   parser_raw.flop "%%a" > !var!.rawvf.rawvf
)

exit