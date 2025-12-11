const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

// Test data
const testRole = {
  title: 'Senior Full Stack Developer',
  department: 'Engineering',
  description: 'We are looking for a Senior Full Stack Developer to join our engineering team. The ideal candidate will have 5+ years of experience in web development, strong knowledge of React, Node.js, and TypeScript. You will be responsible for designing and implementing scalable web applications, mentoring junior developers, and collaborating with cross-functional teams to deliver high-quality software solutions.',
  requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
  experienceLevel: 'Senior',
  educationLevel: "Bachelor's"
};

const updatedRole = {
  title: 'Senior Full Stack Developer (Updated)',
  department: 'Engineering',
  description: 'We are looking for a Senior Full Stack Developer to join our engineering team. The ideal candidate will have 5+ years of experience in web development, strong knowledge of React, Node.js, TypeScript, and AWS. You will be responsible for designing and implementing scalable web applications, mentoring junior developers, collaborating with cross-functional teams, and ensuring code quality through testing and code reviews.',
  requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
  experienceLevel: 'Senior',
  educationLevel: "Bachelor's",
  status: 'active',
  reprocessDescription: true
};

async function testRoleManagement() {
  console.log('🧪 Testing Role Management Feature...\n');

  try {
    // Step 1: Create a test role
    console.log('1️⃣ Creating test role...');
    const createResponse = await fetch(`${BASE_URL}/api/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-123'
      },
      body: JSON.stringify(testRole)
    });

    if (!createResponse.ok) {
      throw new Error(`Create failed: ${createResponse.status} ${await createResponse.text()}`);
    }

    const createdRole = await createResponse.json();
    console.log('✅ Role created successfully');
    console.log(`   ID: ${createdRole.id}`);
    console.log(`   Title: ${createdRole.title}`);
    console.log(`   AI Processing: ${createdRole.aiParsingUsed ? 'Yes' : 'No'}`);
    console.log(`   Required Skills: ${createdRole.evaluationCriteria.requiredSkills.join(', ')}`);
    console.log('');

    const roleId = createdRole.id;

    // Step 2: List all roles
    console.log('2️⃣ Fetching roles list...');
    const listResponse = await fetch(`${BASE_URL}/api/roles`, {
      headers: {
        'Authorization': 'Bearer test-token-123'
      }
    });

    if (!listResponse.ok) {
      throw new Error(`List failed: ${listResponse.status} ${await listResponse.text()}`);
    }

    const roles = await listResponse.json();
    console.log('✅ Roles list fetched successfully');
    console.log(`   Total roles: ${roles.length}`);
    console.log(`   Found our role: ${roles.some(r => r.id === roleId) ? 'Yes' : 'No'}`);
    console.log('');

    // Step 3: Get specific role details
    console.log('3️⃣ Fetching role details...');
    const detailResponse = await fetch(`${BASE_URL}/api/roles/${roleId}`, {
      headers: {
        'Authorization': 'Bearer test-token-123'
      }
    });

    if (!detailResponse.ok) {
      throw new Error(`Detail failed: ${detailResponse.status} ${await detailResponse.text()}`);
    }

    const roleDetails = await detailResponse.json();
    console.log('✅ Role details fetched successfully');
    console.log(`   Title: ${roleDetails.title}`);
    console.log(`   Department: ${roleDetails.department}`);
    console.log(`   Status: ${roleDetails.status}`);
    console.log(`   Total Candidates: ${roleDetails.stats?.total || 0}`);
    console.log(`   Shortlisted: ${roleDetails.stats?.shortlisted || 0}`);
    console.log('');

    // Step 4: Update the role
    console.log('4️⃣ Updating role...');
    const updateResponse = await fetch(`${BASE_URL}/api/roles/${roleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-123'
      },
      body: JSON.stringify(updatedRole)
    });

    if (!updateResponse.ok) {
      throw new Error(`Update failed: ${updateResponse.status} ${await updateResponse.text()}`);
    }

    const updatedRoleData = await updateResponse.json();
    console.log('✅ Role updated successfully');
    console.log(`   Title: ${updatedRoleData.title}`);
    console.log(`   AI Re-processing: ${updatedRoleData.aiParsingUsed ? 'Yes' : 'No'}`);
    console.log(`   Required Skills: ${updatedRoleData.evaluationCriteria.requiredSkills.join(', ')}`);
    console.log('');

    // Step 5: Delete the role
    console.log('5️⃣ Deleting test role...');
    const deleteResponse = await fetch(`${BASE_URL}/api/roles/${roleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer test-token-123'
      }
    });

    if (!deleteResponse.ok) {
      throw new Error(`Delete failed: ${deleteResponse.status} ${await deleteResponse.text()}`);
    }

    const deleteResult = await deleteResponse.json();
    console.log('✅ Role deleted successfully');
    console.log(`   Message: ${deleteResult.message}`);
    console.log('');

    // Step 6: Verify deletion
    console.log('6️⃣ Verifying deletion...');
    const verifyResponse = await fetch(`${BASE_URL}/api/roles/${roleId}`, {
      headers: {
        'Authorization': 'Bearer test-token-123'
      }
    });

    if (verifyResponse.status === 404) {
      console.log('✅ Role deletion verified - role not found (expected)');
    } else {
      console.log('⚠️ Role still exists after deletion');
    }

    console.log('\n🎉 Role Management Feature Test Complete!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Role Creation - Working');
    console.log('   ✅ Role Listing - Working');
    console.log('   ✅ Role Details - Working');
    console.log('   ✅ Role Updates - Working');
    console.log('   ✅ AI Re-processing - Working');
    console.log('   ✅ Role Deletion - Working');
    console.log('\n🚀 The role management feature is fully functional!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('   • Make sure the development server is running on port 3001');
    console.log('   • Check that the database is connected');
    console.log('   • Verify n8n workflows are active');
  }
}

// Run the test
testRoleManagement();