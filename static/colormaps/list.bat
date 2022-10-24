@echo off
SET mypath=%~dp0
echo %mypath% > colormaps.txt
@for /R ".\" %%I in (*.xml) do (
	
	echo %%I >> colormaps.txt
)