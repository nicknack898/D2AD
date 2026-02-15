// Script to clean up test registration data after testing

const API_BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

// Test team names that should be cleaned up
const TEST_TEAM_NAMES = ["Test Warriors", "Test Team Alpha", "Test Team Beta", "API Test Team"]

// Test email patterns
const TEST_EMAIL_PATTERNS = ["captain@testteam.com", "test@example.com", "@test.", "apitest"]

async function cleanupTestData() {
  console.log("🧹 Cleaning up test registration data")
  console.log("=".repeat(40))

  try {
    // First, let's see what test data exists
    console.log("\n📋 Checking for test data...")

    const response = await fetch(`${API_BASE_URL}/api/registrations?limit=50`)
    const result = await response.json()

    if (!response.ok) {
      console.log("❌ Could not fetch registrations for cleanup")
      return
    }

    const testTeams =
      result.data?.filter((team) => {
        const isTestTeamName = TEST_TEAM_NAMES.some((testName) =>
          team.team_name.toLowerCase().includes(testName.toLowerCase()),
        )
        const isTestEmail = TEST_EMAIL_PATTERNS.some((pattern) =>
          team.contact_email.toLowerCase().includes(pattern.toLowerCase()),
        )
        return isTestTeamName || isTestEmail
      }) || []

    if (testTeams.length === 0) {
      console.log("✅ No test data found to clean up")
      return
    }

    console.log(`\n🔍 Found ${testTeams.length} test registrations:`)
    testTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. "${team.team_name}" (${team.contact_email}) - ${team.status}`)
    })

    console.log("\n⚠️  Note: This script identifies test data but does not delete it.")
    console.log("   To clean up test data, run the SQL cleanup script or use admin interface.")
    console.log("\n   Test data identified by:")
    console.log(`   - Team names containing: ${TEST_TEAM_NAMES.join(", ")}`)
    console.log(`   - Email addresses containing: ${TEST_EMAIL_PATTERNS.join(", ")}`)
  } catch (error) {
    console.log("❌ Error during cleanup check:")
    console.log(`   ${error.message}`)
  }
}

// Run cleanup check
cleanupTestData().catch(console.error)
