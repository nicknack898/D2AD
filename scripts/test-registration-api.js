// Test script to verify the team registration API endpoint works end-to-end

const API_BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

// Test data for a valid team registration
const validTeamData = {
  teamName: "Test Warriors",
  contact: {
    email: "captain@testteam.com",
    discord: "testcaptain#1234",
    steam: "76561198123456789",
  },
  members: [
    {
      name: "Captain Test",
      steamId: "76561198123456789",
      isCaptain: true,
    },
    {
      name: "Player Two",
      steamId: "76561198123456790",
      isCaptain: false,
    },
    {
      name: "Player Three",
      steamId: "76561198123456791",
      isCaptain: false,
    },
    {
      name: "Player Four",
      steamId: "76561198123456792",
      isCaptain: false,
    },
    {
      name: "Player Five",
      steamId: "76561198123456793",
      isCaptain: false,
    },
  ],
  notes: "This is a test registration to verify the API works correctly.",
}

// Test data with validation errors
const invalidTeamData = {
  teamName: "", // Missing team name
  contact: {
    email: "invalid-email", // Invalid email format
    discord: "test@#$%", // Invalid Discord format
    steam: "123", // Invalid Steam ID
  },
  members: [
    {
      name: "Captain Test",
      steamId: "76561198123456789",
      isCaptain: true,
    },
    // Missing other team members (should have 5 total)
  ],
}

// Test data for duplicate team name
const duplicateTeamData = {
  ...validTeamData,
  teamName: "Test Warriors", // Same name as first test
  contact: {
    ...validTeamData.contact,
    email: "different@email.com",
  },
  members: validTeamData.members.map((member) => ({
    ...member,
    steamId: member.steamId.replace(/\d$/, "4"), // Change last digit to avoid duplicate Steam IDs
  })),
}

async function testRegistrationAPI() {
  console.log("🧪 Testing Team Registration API Endpoint")
  console.log("=".repeat(50))

  // Test 1: Valid registration
  console.log("\n📝 Test 1: Valid Team Registration")
  try {
    const response = await fetch(`${API_BASE_URL}/api/registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validTeamData),
    })

    const result = await response.json()

    if (response.ok) {
      console.log("✅ SUCCESS: Valid registration accepted")
      console.log(`   Team ID: ${result.teamId}`)
      console.log(`   Message: ${result.message}`)
    } else {
      console.log("❌ FAILED: Valid registration rejected")
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${result.error || result.message}`)
    }
  } catch (error) {
    console.log("❌ ERROR: Request failed")
    console.log(`   ${error.message}`)
  }

  // Test 2: Invalid data validation
  console.log("\n📝 Test 2: Invalid Data Validation")
  try {
    const response = await fetch(`${API_BASE_URL}/api/registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invalidTeamData),
    })

    const result = await response.json()

    if (response.status === 422) {
      console.log("✅ SUCCESS: Invalid data properly rejected")
      console.log(`   Validation errors: ${result.details?.length || 0}`)
      if (result.details) {
        result.details.forEach((error) => {
          console.log(`   - ${error.path.join(".")}: ${error.message}`)
        })
      }
    } else {
      console.log("❌ FAILED: Invalid data should be rejected with 422 status")
      console.log(`   Status: ${response.status}`)
      console.log(`   Response: ${JSON.stringify(result, null, 2)}`)
    }
  } catch (error) {
    console.log("❌ ERROR: Request failed")
    console.log(`   ${error.message}`)
  }

  // Test 3: Duplicate team name
  console.log("\n📝 Test 3: Duplicate Team Name Detection")
  try {
    const response = await fetch(`${API_BASE_URL}/api/registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(duplicateTeamData),
    })

    const result = await response.json()

    if (response.status === 409) {
      console.log("✅ SUCCESS: Duplicate team name properly rejected")
      console.log(`   Message: ${result.message}`)
    } else if (response.ok) {
      console.log("⚠️  WARNING: Duplicate team name was accepted (might be expected if first test failed)")
      console.log(`   Team ID: ${result.teamId}`)
    } else {
      console.log("❌ FAILED: Unexpected response for duplicate team name")
      console.log(`   Status: ${response.status}`)
      console.log(`   Response: ${JSON.stringify(result, null, 2)}`)
    }
  } catch (error) {
    console.log("❌ ERROR: Request failed")
    console.log(`   ${error.message}`)
  }

  // Test 4: Get registrations
  console.log("\n📝 Test 4: Fetch Registrations")
  try {
    const response = await fetch(`${API_BASE_URL}/api/registrations?limit=5`)
    const result = await response.json()

    if (response.ok) {
      console.log("✅ SUCCESS: Registrations fetched successfully")
      console.log(`   Total teams: ${result.pagination?.total || 0}`)
      console.log(`   Teams in response: ${result.data?.length || 0}`)

      if (result.data && result.data.length > 0) {
        console.log("\n   Recent teams:")
        result.data.slice(0, 3).forEach((team, index) => {
          console.log(`   ${index + 1}. ${team.team_name} (${team.status}) - ${team.members?.length || 0} members`)
        })
      }
    } else {
      console.log("❌ FAILED: Could not fetch registrations")
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${result.error || result.message}`)
    }
  } catch (error) {
    console.log("❌ ERROR: Request failed")
    console.log(`   ${error.message}`)
  }

  // Test 5: Invalid JSON
  console.log("\n📝 Test 5: Invalid JSON Handling")
  try {
    const response = await fetch(`${API_BASE_URL}/api/registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "invalid json{",
    })

    const result = await response.json()

    if (response.status === 400) {
      console.log("✅ SUCCESS: Invalid JSON properly rejected")
      console.log(`   Message: ${result.error || result.message}`)
    } else {
      console.log("❌ FAILED: Invalid JSON should be rejected with 400 status")
      console.log(`   Status: ${response.status}`)
    }
  } catch (error) {
    console.log("❌ ERROR: Request failed")
    console.log(`   ${error.message}`)
  }

  console.log("\n" + "=".repeat(50))
  console.log("🏁 API Testing Complete")
  console.log("\nNext steps:")
  console.log("1. Check the database to verify data was stored correctly")
  console.log("2. Test the registration form in the browser")
  console.log("3. Verify email notifications (when implemented)")
  console.log("4. Test admin team management interface")
}

// Run the tests
testRegistrationAPI().catch(console.error)
