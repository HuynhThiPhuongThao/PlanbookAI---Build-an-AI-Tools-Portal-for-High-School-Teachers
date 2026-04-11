$dir = 'd:\XDOPP\planbook-ai\frontend\src\app\pages'

$patchMap = @{
  'AdminUsers.tsx'       = 'export default function AdminUsers() {'
  'ExamGenerator.tsx'    = 'export default function ExamGenerator() {'
  'ExerciseCreator.tsx'  = 'export default function ExerciseCreator() {'
  'LessonPlanner.tsx'    = 'export default function LessonPlanner() {'
  'ManagerDashboard.tsx' = 'export default function ManagerDashboard() {'
  'OCRGrading.tsx'       = 'export default function OCRGrading() {'
  'QuestionBank.tsx'     = 'export default function QuestionBank() {'
  'StaffDashboard.tsx'   = 'export default function StaffDashboard() {'
  'StudentResults.tsx'   = 'export default function StudentResults() {'
}

foreach ($file in $patchMap.Keys) {
  $path = Join-Path $dir $file
  $content = Get-Content $path -Raw -Encoding UTF8

  # Skip if already has realName
  if ($content -match 'const realName = useRealUserName') {
    Write-Host "Already OK: $file"
    continue
  }

  $funcLine = $patchMap[$file]
  $replacement = $funcLine + "`r`n  const realName = useRealUserName();"
  $content = $content.Replace($funcLine, $replacement)

  Set-Content -Path $path -Value $content -Encoding UTF8
  Write-Host "Patched: $file"
}
Write-Host "Done!"
