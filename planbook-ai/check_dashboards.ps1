$dir = 'd:\XDOPP\planbook-ai\frontend\src\app\pages'
$files = @('AdminUsers','ExamGenerator','ExerciseCreator','LessonPlanner','ManagerDashboard','OCRGrading','QuestionBank','StaffDashboard','StudentResults')
foreach ($f in $files) {
  $path = Join-Path $dir ($f + '.tsx')
  $content = Get-Content $path -Raw
  if ($content -notmatch 'export default function') {
    Write-Host "BROKEN: $f"
  } elseif ($content -match 'const realName = useRealUserName') {
    Write-Host "OK: $f"
  } else {
    Write-Host "MISSING_realName: $f"
  }
}
