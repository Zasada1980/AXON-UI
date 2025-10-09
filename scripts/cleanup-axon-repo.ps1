# 🧹 AXON Repository Cleanup Script
# Critical: Remove ALL development debris before integration
# Version: 1.0
# Date: 9 октября 2025 г.

param(
    [Parameter(Mandatory=$false)]
    [string]$AxonRepoPath = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$DetailedOutput = $false
)

# ============================================================================
# Configuration
# ============================================================================

$ErrorActionPreference = "Continue"
$WarningPreference = "Continue"

# ASCII Art Banner
$banner = @"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        🧹 AXON REPOSITORY CLEANUP SCRIPT                     ║
║        Critical Development Debris Removal                    ║
║        Version 1.0 | 9 октября 2025                          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
"@

Write-Host $banner -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# Find AXON Repository
# ============================================================================

function Find-AxonRepository {
    Write-Host "🔍 Searching for AXON repository..." -ForegroundColor Yellow
    
    # Common locations to check
    $possibleLocations = @(
        "d:\AXON",
        "c:\AXON",
        "e:\AXON",
        "$env:USERPROFILE\AXON",
        "$env:USERPROFILE\Documents\AXON",
        "$env:USERPROFILE\source\repos\AXON"
    )
    
    foreach ($location in $possibleLocations) {
        if (Test-Path $location) {
            # Verify it's a git repository
            if (Test-Path (Join-Path $location ".git")) {
                Write-Host "✅ Found AXON repository at: $location" -ForegroundColor Green
                return $location
            }
        }
    }
    
    Write-Host "❌ AXON repository not found in common locations!" -ForegroundColor Red
    Write-Host "   Please specify path using -AxonRepoPath parameter" -ForegroundColor Yellow
    return $null
}

if ([string]::IsNullOrEmpty($AxonRepoPath)) {
    $AxonRepoPath = Find-AxonRepository
    if ($null -eq $AxonRepoPath) {
        Write-Host ""
        Write-Host "Example usage:" -ForegroundColor Cyan
        Write-Host "  .\cleanup-axon-repo.ps1 -AxonRepoPath 'd:\AXON'" -ForegroundColor Gray
        Write-Host "  .\cleanup-axon-repo.ps1 -AxonRepoPath 'd:\AXON' -DryRun" -ForegroundColor Gray
        exit 1
    }
}

# Verify path exists
if (-not (Test-Path $AxonRepoPath)) {
    Write-Host "❌ ERROR: Path does not exist: $AxonRepoPath" -ForegroundColor Red
    exit 1
}

# Verify it's a git repository
if (-not (Test-Path (Join-Path $AxonRepoPath ".git"))) {
    Write-Host "⚠️  WARNING: Not a git repository: $AxonRepoPath" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

Write-Host ""
Write-Host "📂 Target Repository: $AxonRepoPath" -ForegroundColor Cyan
Write-Host "🔧 Dry Run Mode: $DryRun" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "⚠️  DRY RUN MODE - No files will be deleted!" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================================================
# Cleanup Patterns
# ============================================================================

$cleanupPatterns = @{
    "Backup Directories" = @{
        Patterns = @("backups", "backup", "bak", "old")
        IsDirectory = $true
        Priority = 1
        Risk = "EXTREME"
    }
    "Python Cache" = @{
        Patterns = @("__pycache__", "*.pyc", "*.pyo", ".pytest_cache")
        IsDirectory = $true
        Priority = 1
        Risk = "HIGH"
    }
    "Virtual Environments" = @{
        Patterns = @(".venv", "venv", "env", ".env")
        IsDirectory = $true
        Priority = 1
        Risk = "EXTREME"
    }
    "Development Logs" = @{
        Patterns = @("pytest-run-*.log", "*.log", "project_dirs.txt", "project_structure.txt", "project_tree.txt")
        IsDirectory = $false
        Priority = 2
        Risk = "HIGH"
    }
    "Database Files" = @{
        Patterns = @("*.db", "*.sqlite", "*.sqlite3")
        IsDirectory = $false
        Priority = 2
        Risk = "MEDIUM"
    }
    "Build Artifacts" = @{
        Patterns = @("*.egg-info", "dist", "build", ".eggs")
        IsDirectory = $true
        Priority = 2
        Risk = "LOW"
    }
    "Node Modules" = @{
        Patterns = @("node_modules")
        IsDirectory = $true
        Priority = 1
        Risk = "EXTREME"
    }
    "Temporary Files" = @{
        Patterns = @("*.tmp", "*.temp", "*.bak", "*~")
        IsDirectory = $false
        Priority = 3
        Risk = "LOW"
    }
}

# ============================================================================
# Statistics
# ============================================================================

$stats = @{
    TotalFound = 0
    TotalSize = 0
    Deleted = 0
    Failed = 0
    Skipped = 0
}

# ============================================================================
# Helper Functions
# ============================================================================

function Format-FileSize {
    param([long]$Size)
    
    if ($Size -gt 1GB) {
        return "{0:N2} GB" -f ($Size / 1GB)
    } elseif ($Size -gt 1MB) {
        return "{0:N2} MB" -f ($Size / 1MB)
    } elseif ($Size -gt 1KB) {
        return "{0:N2} KB" -f ($Size / 1KB)
    } else {
        return "$Size bytes"
    }
}

function Get-DirectorySize {
    param([string]$Path)
    
    try {
        $size = (Get-ChildItem -Path $Path -Recurse -Force -ErrorAction SilentlyContinue | 
                 Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
        return $size
    } catch {
        return 0
    }
}

function Remove-SafeItem {
    param(
        [string]$Path,
        [bool]$IsDirectory,
        [string]$Category
    )
    
    try {
        if ($DryRun) {
            Write-Host "    [DRY RUN] Would delete: $Path" -ForegroundColor Gray
            $stats.Skipped++
            return $true
        }
        
        if ($IsDirectory) {
            Remove-Item -Path $Path -Recurse -Force -ErrorAction Stop
        } else {
            Remove-Item -Path $Path -Force -ErrorAction Stop
        }
        
        $stats.Deleted++
        if ($DetailedOutput) {
            Write-Host "    ✓ Deleted: $Path" -ForegroundColor Green
        }
        return $true
        
    } catch {
        Write-Host "    ✗ Failed to delete: $Path" -ForegroundColor Red
        Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Red
        $stats.Failed++
        return $false
    }
}

# ============================================================================
# Main Cleanup Logic
# ============================================================================

Write-Host "🔍 Scanning repository for development debris..." -ForegroundColor Yellow
Write-Host ""

Push-Location $AxonRepoPath

try {
    foreach ($categoryName in $cleanupPatterns.Keys | Sort-Object { $cleanupPatterns[$_].Priority }) {
        $category = $cleanupPatterns[$categoryName]
        
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
        Write-Host "🗂️  Category: $categoryName" -ForegroundColor Cyan
        Write-Host "   Risk Level: $($category.Risk)" -ForegroundColor $(
            switch ($category.Risk) {
                "EXTREME" { "Red" }
                "HIGH" { "Yellow" }
                "MEDIUM" { "Cyan" }
                "LOW" { "Green" }
            }
        )
        Write-Host ""
        
        $foundItems = @()
        
        foreach ($pattern in $category.Patterns) {
            if ($DetailedOutput) {
                Write-Host "  Searching for pattern: $pattern" -ForegroundColor Gray
            }
            
            if ($category.IsDirectory) {
                # Search for directories
                $items = Get-ChildItem -Path $AxonRepoPath -Filter $pattern -Directory -Recurse -Force -ErrorAction SilentlyContinue
            } else {
                # Search for files
                $items = Get-ChildItem -Path $AxonRepoPath -Filter $pattern -File -Recurse -Force -ErrorAction SilentlyContinue
            }
            
            $foundItems += $items
        }
        
        if ($foundItems.Count -eq 0) {
            Write-Host "  ✅ No items found" -ForegroundColor Green
            Write-Host ""
            continue
        }
        
        Write-Host "  Found $($foundItems.Count) items:" -ForegroundColor Yellow
        
        $categorySize = 0
        foreach ($item in $foundItems) {
            $itemSize = if ($item.PSIsContainer) {
                Get-DirectorySize -Path $item.FullName
            } else {
                $item.Length
            }
            
            $categorySize += $itemSize
            $stats.TotalFound++
            $stats.TotalSize += $itemSize
            
            $relativePath = $item.FullName.Replace($AxonRepoPath, ".").Replace("\", "/")
            Write-Host "    📄 $relativePath ($(Format-FileSize $itemSize))" -ForegroundColor White
            
            # Delete the item
            Remove-SafeItem -Path $item.FullName -IsDirectory $item.PSIsContainer -Category $categoryName
        }
        
        Write-Host ""
        Write-Host "  Category Total: $(Format-FileSize $categorySize)" -ForegroundColor Magenta
        Write-Host ""
    }
    
} finally {
    Pop-Location
}

# ============================================================================
# Final Statistics
# ============================================================================

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "📊 CLEANUP STATISTICS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Items Found:     $($stats.TotalFound)" -ForegroundColor White
Write-Host "  Total Size:      $(Format-FileSize $stats.TotalSize)" -ForegroundColor White
Write-Host ""

if ($DryRun) {
    Write-Host "  Would Delete:    $($stats.Skipped)" -ForegroundColor Yellow
} else {
    Write-Host "  Deleted:         $($stats.Deleted)" -ForegroundColor Green
    Write-Host "  Failed:          $($stats.Failed)" -ForegroundColor $(if ($stats.Failed -gt 0) { "Red" } else { "Green" })
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

# ============================================================================
# Recommendations
# ============================================================================

Write-Host ""
Write-Host "💡 RECOMMENDATIONS:" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "  • Re-run without -DryRun to perform actual cleanup" -ForegroundColor Yellow
    Write-Host "    .\cleanup-axon-repo.ps1 -AxonRepoPath '$AxonRepoPath'" -ForegroundColor Gray
} else {
    if ($stats.Deleted -gt 0) {
        Write-Host "  ✅ Cleanup completed successfully!" -ForegroundColor Green
        Write-Host "  • Repository is now clean and ready for integration" -ForegroundColor Green
    } else {
        Write-Host "  ℹ️  Repository was already clean" -ForegroundColor Cyan
    }
}

if ($stats.Failed -gt 0) {
    Write-Host ""
    Write-Host "  ⚠️  Some items could not be deleted" -ForegroundColor Yellow
    Write-Host "  • Check file permissions" -ForegroundColor Yellow
    Write-Host "  • Close applications using those files" -ForegroundColor Yellow
    Write-Host "  • Run as Administrator if needed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Review the cleanup results above" -ForegroundColor White
Write-Host "  2. Verify repository integrity: git status" -ForegroundColor White
Write-Host "  3. Proceed with integration as per INTEGRATION_PLAN.md" -ForegroundColor White
Write-Host ""

# ============================================================================
# Exit
# ============================================================================

if ($stats.Failed -gt 0) {
    exit 1
} else {
    exit 0
}
