param([Parameter(Mandatory=$true)][string]$BuildTools,[Parameter(Mandatory=$true)][string]$AndroidJar,[Parameter(Mandatory=$true)][string]$Jdk,[Parameter(Mandatory=$true)][string]$BuildDirectory)
$ErrorActionPreference='Stop'
$env:JAVA_HOME=(Resolve-Path -LiteralPath $Jdk).Path
$env:Path="$env:JAVA_HOME\bin;$env:Path"
$buildPath=[IO.Path]::GetFullPath($BuildDirectory)
New-Item -ItemType Directory -Force $buildPath,(Join-Path $buildPath 'classes'),(Join-Path $buildPath 'dex') | Out-Null
function CheckExit {if($LASTEXITCODE -ne 0){throw "Build command failed: $LASTEXITCODE"}}
& "$Jdk/bin/javac.exe" -encoding UTF-8 -source 8 -target 8 -classpath $AndroidJar -d "$buildPath/classes" "$PSScriptRoot/AlarmActivity.java"
CheckExit
$classes=Get-ChildItem "$buildPath/classes" -Filter '*.class' -Recurse | Select-Object -ExpandProperty FullName
& "$BuildTools/d8.bat" --min-api 26 --lib $AndroidJar --output "$buildPath/dex" $classes
CheckExit
& "$BuildTools/aapt2.exe" link -o "$buildPath/unsigned.apk" -I $AndroidJar --manifest "$PSScriptRoot/AndroidManifest.xml" --min-sdk-version 26 --target-sdk-version 36
CheckExit
& "$Jdk/bin/jar.exe" uf "$buildPath/unsigned.apk" -C "$buildPath/dex" classes.dex
CheckExit
& "$BuildTools/zipalign.exe" -f 4 "$buildPath/unsigned.apk" "$buildPath/aligned.apk"
CheckExit
if(!(Test-Path -LiteralPath "$buildPath/test-key.jks")){
  & "$Jdk/bin/keytool.exe" -genkeypair -keystore "$buildPath/test-key.jks" -alias gunluk-test -storepass android -keypass android -keyalg RSA -keysize 2048 -validity 3650 -dname 'CN=Gunluk Asistan Local Test'
  CheckExit
}
& "$BuildTools/apksigner.bat" sign --ks "$buildPath/test-key.jks" --ks-key-alias gunluk-test --ks-pass pass:android --key-pass pass:android --out "$buildPath/gunluk-alarm-test.apk" "$buildPath/aligned.apk"
CheckExit
& "$BuildTools/apksigner.bat" verify --verbose "$buildPath/gunluk-alarm-test.apk"
CheckExit
Write-Output "$buildPath/gunluk-alarm-test.apk"
