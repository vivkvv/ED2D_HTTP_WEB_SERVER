@echo off
SET mypath=%~dp0
echo %mypath% > games.txt
@for /R ".\" %%I in (*.xml) do (
	
	echo %%I >> games.txt
)