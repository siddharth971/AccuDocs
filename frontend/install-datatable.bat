
@echo off
echo Installing DataTable Dependencies...
echo.

call npm install @swimlane/ngx-datatable exceljs file-saver jspdf jspdf-autotable @ngneat/hot-toast @phosphor-icons/angular --legacy-peer-deps

echo.
echo Installing Type Definitions...
call npm install --save-dev @types/file-saver @types/jspdf --legacy-peer-deps

echo.
echo Installation Complete!
pause
