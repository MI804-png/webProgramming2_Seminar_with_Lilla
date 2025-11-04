# Login Status Verification Script

Write-Host "======================================"
Write-Host "TechCorp Login Status Verification"
Write-Host "======================================"

# Test with session from login
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Write-Host "1. Logging in..."
$loginData = @{
    username = "admin"
    password = "admin123"
}

$loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/login" -Method POST -Body $loginData -WebSession $session -MaximumRedirection 0 -ErrorAction SilentlyContinue

if ($loginResponse.StatusCode -eq 302) {
    Write-Host "✅ Login successful (Status: 302)"
    
    Write-Host "2. Checking home page with authenticated session..."
    $homePage = Invoke-WebRequest -Uri "http://localhost:3000/" -WebSession $session
    
    # Look for admin indicators in the response
    $content = $homePage.Content
    
    Write-Host "3. Checking for authentication indicators..."
    
    if ($content -match "admin" -and $content -match "Admin") {
        Write-Host "✅ User 'admin' appears to be logged in"
    } else {
        Write-Host "❌ Admin user not detected in page content"
    }
    
    if ($content -match "Logout") {
        Write-Host "✅ Logout link found - user is authenticated"
    } else {
        Write-Host "❌ No logout link found"
    }
    
    if ($content -match "Login.*Register") {
        Write-Host "❌ Still showing Login/Register - authentication may have failed"
    } else {
        Write-Host "✅ Login/Register links not visible - user appears authenticated"
    }
    
    Write-Host "4. Testing CRUD access (admin-only)..."
    $crudPage = Invoke-WebRequest -Uri "http://localhost:3000/crud" -WebSession $session -ErrorAction SilentlyContinue
    
    if ($crudPage.StatusCode -eq 200) {
        Write-Host "✅ CRUD page accessible - admin privileges confirmed"
    } else {
        Write-Host "❌ CRUD page not accessible (Status: $($crudPage.StatusCode))"
    }
    
} else {
    Write-Host "❌ Login failed (Status: $($loginResponse.StatusCode))"
}

Write-Host "======================================"
Write-Host "Verification Complete"
