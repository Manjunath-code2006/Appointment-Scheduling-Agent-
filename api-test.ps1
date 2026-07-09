$base = "http://localhost:8080/api"

function Test-Api($method, $url, $body, $token) {
    $headers = @{ "Content-Type" = "application/json" }
    if ($token) { $headers["Authorization"] = "Bearer $token" }
    try {
        $params = @{
            Uri         = "$base$url"
            Method      = $method
            Headers     = $headers
            UseBasicParsing = $true
            TimeoutSec  = 10
            ErrorAction = "Stop"
        }
        if ($body) { $params["Body"] = ($body | ConvertTo-Json -Depth 5) }
        $r = Invoke-WebRequest @params
        $j = $r.Content | ConvertFrom-Json
        return $j
    }
    catch {
        $msg = $_.Exception.Message
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $msg = $reader.ReadToEnd()
        }
        Write-Host "  ERROR: $msg" -ForegroundColor Red
        return $null
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  APPOINTMENT AGENT - API TEST SUITE   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Health
Write-Host "[1] Health Check..." -ForegroundColor Yellow
$h = Test-Api "GET" "/actuator/health"
# Actuator returns {"status":"UP"} directly, not wrapped in .data
if ($h -and ($h.status -eq "UP" -or ($h.data -and $h.data.status -eq "UP"))) {
    Write-Host "  PASS - Status: UP" -ForegroundColor Green
} else {
    Write-Host "  FAIL" -ForegroundColor Red
}

# 2. Admin Login
Write-Host "[2] Admin Login..." -ForegroundColor Yellow
$login = Test-Api "POST" "/auth/login" @{ email="admin@appointmentagent.com"; password="Admin@1234" }
if ($login -and $login.data -and $login.data.accessToken) {
    $adminToken = $login.data.accessToken
    Write-Host "  PASS - Token: $($adminToken.Substring(0,20))..." -ForegroundColor Green
} else {
    Write-Host "  FAIL - Could not log in as admin" -ForegroundColor Red
    exit 1
}

# 3. Customer Login
Write-Host "[3] Customer Login..." -ForegroundColor Yellow
$custLogin = Test-Api "POST" "/auth/login" @{ email="jane.smith@example.com"; password="Customer@1234" }
if ($custLogin -and $custLogin.data -and $custLogin.data.accessToken) {
    $custToken = $custLogin.data.accessToken
    Write-Host "  PASS - Logged in as $($custLogin.data.user.firstName)" -ForegroundColor Green
} else {
    Write-Host "  FAIL" -ForegroundColor Red
}

# 4. Get Settings
Write-Host "[4] Get App Settings..." -ForegroundColor Yellow
$settings = Test-Api "GET" "/settings" $null $adminToken
if ($settings -and $settings.data) {
    Write-Host "  PASS - Business: $($settings.data.businessName)" -ForegroundColor Green
} else {
    Write-Host "  FAIL" -ForegroundColor Red
}

# 5. Get Providers
Write-Host "[5] Get Providers..." -ForegroundColor Yellow
$providers = Test-Api "GET" "/providers" $null $adminToken
if ($providers -and $providers.data) {
    Write-Host "  PASS - $($providers.data.Count) provider(s) found" -ForegroundColor Green
    $firstProviderId = $providers.data[0].id
} else {
    Write-Host "  FAIL" -ForegroundColor Red
}

# 6. Get Services
Write-Host "[6] Get Services..." -ForegroundColor Yellow
$services = Test-Api "GET" "/services" $null $adminToken
if ($services -and $services.data) {
    Write-Host "  PASS - $($services.data.Count) service(s) found" -ForegroundColor Green
    $firstServiceId = $services.data[0].id
} else {
    Write-Host "  FAIL" -ForegroundColor Red
}

# 7. Check Availability
Write-Host "[7] Check Availability..." -ForegroundColor Yellow
$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
$avail = Test-Api "GET" "/availability/provider/$firstProviderId`?date=$tomorrow&serviceId=$firstServiceId" $null $custToken
if ($avail -and $avail.data) {
    $slotCount = ($avail.data.availableSlots | Where-Object { $_.available }).Count
    Write-Host "  PASS - $slotCount available slot(s) on $tomorrow" -ForegroundColor Green
} else {
    Write-Host "  FAIL" -ForegroundColor Red
}

# 8. Admin Dashboard
Write-Host "[8] Admin Dashboard..." -ForegroundColor Yellow
$dash = Test-Api "GET" "/dashboard" $null $adminToken
if ($dash -and $dash.data) {
    Write-Host "  PASS - Total: $($dash.data.totalAppointments) appts, Customers: $($dash.data.totalCustomers)" -ForegroundColor Green
} else {
    Write-Host "  FAIL" -ForegroundColor Red
}

# 9. Get Holidays
Write-Host "[9] Get Holidays..." -ForegroundColor Yellow
$holidays = Test-Api "GET" "/holidays" $null $adminToken
if ($holidays -and $null -ne $holidays.data) {
    Write-Host "  PASS - $($holidays.data.Count) holiday(s)" -ForegroundColor Green
} else {
    Write-Host "  FAIL" -ForegroundColor Red
}

# 10. Get My Appointments (Customer)
Write-Host "[10] Get My Appointments..." -ForegroundColor Yellow
$myAppts = Test-Api "GET" "/appointments/my" $null $custToken
if ($myAppts -and $null -ne $myAppts.data) {
    Write-Host "  PASS - $($myAppts.data.Count) appointment(s) for Jane" -ForegroundColor Green
} else {
    Write-Host "  FAIL" -ForegroundColor Red
}

# 11. Book an Appointment
Write-Host "[11] Book New Appointment..." -ForegroundColor Yellow
if ($firstProviderId -and $firstServiceId) {
    $bookDate = (Get-Date).AddDays(3)
    # Find a weekday
    while ($bookDate.DayOfWeek -eq "Saturday" -or $bookDate.DayOfWeek -eq "Sunday") {
        $bookDate = $bookDate.AddDays(1)
    }
    $bookBody = @{
        providerId      = $firstProviderId
        serviceId       = $firstServiceId
        appointmentDate = $bookDate.ToString("yyyy-MM-dd")
        startTime       = "11:00:00"
        notes           = "API test booking"
    }
    $booked = Test-Api "POST" "/appointments" $bookBody $custToken
    if ($booked -and $booked.data -and $booked.data.appointmentNumber) {
        Write-Host "  PASS - Booked: $($booked.data.appointmentNumber)" -ForegroundColor Green
        $bookedId = $booked.data.id
    } else {
        Write-Host "  FAIL" -ForegroundColor Red
    }
}

# 12. Cancel the booked appointment
if ($bookedId) {
    Write-Host "[12] Cancel Appointment..." -ForegroundColor Yellow
    $cancelled = Test-Api "PUT" "/appointments/$bookedId/cancel" @{ reason="API test cancel" } $custToken
    if ($cancelled -and $cancelled.data -and $cancelled.data.status -eq "CANCELLED") {
        Write-Host "  PASS - Status: $($cancelled.data.status)" -ForegroundColor Green
    } else {
        Write-Host "  FAIL" -ForegroundColor Red
    }
}

# 13. User Registration
Write-Host "[13] New User Registration..." -ForegroundColor Yellow
$reg = Test-Api "POST" "/auth/register" @{
    firstName = "Test"
    lastName  = "User"
    email     = "testuser$(Get-Random -Maximum 9999)@example.com"
    password  = "Test@1234"
    phone     = "+1555999888"
}
if ($reg -and $reg.success) {
    Write-Host "  PASS - $($reg.message)" -ForegroundColor Green
} else {
    Write-Host "  FAIL" -ForegroundColor Red
}

# 14. Chat API
Write-Host "[14] Chat API..." -ForegroundColor Yellow
$chat = Test-Api "POST" "/chat/message" @{ message = "What appointments do I have?" } $custToken
if ($chat -and $chat.data -and $chat.data.message) {
    Write-Host "  PASS - Bot replied: $($chat.data.message.Substring(0, [Math]::Min(60, $chat.data.message.Length)))..." -ForegroundColor Green
} else {
    Write-Host "  FAIL" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ALL TESTS COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Backend:  http://localhost:8080/api" -ForegroundColor Green
Write-Host "Swagger:  http://localhost:8080/api/swagger-ui.html" -ForegroundColor Green
