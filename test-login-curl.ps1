# Test login using curl
# This script tests the login functionality

Write-Host "Testing TechCorp Login Functionality"
Write-Host "======================================"

# Test 1: Get login page to get session cookie
Write-Host "1. Getting login page..."
$loginPage = Invoke-WebRequest -Uri "http://localhost:3000/login" -SessionVariable session
Write-Host "Status: $($loginPage.StatusCode)"

# Test 2: Attempt login
Write-Host "2. Attempting login with admin/admin123..."
$loginData = @{
    username = "admin"
    password = "admin123"
}

$loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/login" -Method POST -Body $loginData -WebSession $session -MaximumRedirection 0 -ErrorAction SilentlyContinue

Write-Host "Login Response Status: $($loginResponse.StatusCode)"
Write-Host "Location Header: $($loginResponse.Headers.Location)"

# Test 3: Check if redirected to home page (success)
if ($loginResponse.StatusCode -eq 302 -and $loginResponse.Headers.Location -eq "/") {
    Write-Host "✅ Login successful - redirected to home page"
    
    # Test accessing home page with session
    Write-Host "3. Accessing home page with session..."
    $homePage = Invoke-WebRequest -Uri "http://localhost:3000/" -WebSession $session
    Write-Host "Home page status: $($homePage.StatusCode)"
    
    # Check if admin is logged in by looking for admin-specific content
    if ($homePage.Content -like "*admin*" -or $homePage.Content -like "*Admin*") {
        Write-Host "✅ Admin user appears to be logged in"
    } else {
        Write-Host "❌ Admin user does not appear to be logged in"
    }
    
} else {
    Write-Host "❌ Login failed or unexpected redirect"
    Write-Host "Response content: $($loginResponse.Content)"
}

Write-Host "Test completed."
