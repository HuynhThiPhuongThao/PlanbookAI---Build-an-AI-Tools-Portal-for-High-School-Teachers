$pagesDir = 'd:\XDOPP\planbook-ai\frontend\src\app\pages'

$files = @(
  'AdminDashboard.tsx',
  'AdminUsers.tsx',
  'ExamGenerator.tsx',
  'ExerciseCreator.tsx',
  'LessonPlanner.tsx',
  'ManagerDashboard.tsx',
  'OCRGrading.tsx',
  'QuestionBank.tsx',
  'StaffDashboard.tsx',
  'StudentResults.tsx'
)

foreach ($file in $files) {
  $path = Join-Path $pagesDir $file
  $content = Get-Content $path -Raw -Encoding UTF8

  if ($content -match 'useRealUserName') {
    Write-Host "$file already patched, skipping"
    continue
  }

  # Replace hardcoded userName strings with {realName}
  $content = $content -replace 'userName="Dr\. Nguy[^"]*"', 'userName={realName}'
  $content = $content -replace 'userName="Staff [^"]*"', 'userName={realName}'
  $content = $content -replace 'userName="Manager [^"]*"', 'userName={realName}'
  $content = $content -replace 'userName="Admin [^"]*"', 'userName={realName}'
  $content = $content -replace 'userName="Admin"', 'userName={realName}'

  # Inject helper after last import line, before export default
  $helperSnippet = @"

import React from 'react';

function getNameFromToken(): string {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.fullName || '';
  } catch { return ''; }
}

function useRealUserName() {
  const [name, setName] = React.useState(getNameFromToken());
  React.useEffect(() => {
    const h = (e: any) => { if (e.detail?.fullName) setName(e.detail.fullName); };
    window.addEventListener('profileUpdated', h);
    return () => window.removeEventListener('profileUpdated', h);
  }, []);
  return name;
}

"@

  # Insert helper block right before 'export default function'
  $content = $content -replace '(\r?\nexport default function)', "$helperSnippet`$1"

  # Add realName const as first line inside export default function body
  $content = $content -replace '(export default function \w+\(\) \{)', '$1' + "`r`n  const realName = useRealUserName();"

  Set-Content -Path $path -Value $content -Encoding UTF8
  Write-Host "Patched: $file"
}

Write-Host "Done! All files processed."
