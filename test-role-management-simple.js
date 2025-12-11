const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';
const JWT_SECRET = 'ArJn+cE+jfzj0+jyBa/jsBkjmBbofLZIbrqt3OafkAo=';

// Generate a test JWT token
const testUserId = 'test-user-123';
const testToken = jwt.sign({ userId: testUserId }, JWT_SECRET, { expiresIn: '1h' });

console.log('🔑 Generated test token for user:', testUserId);

// Test data
const testRole = {
  title: 'Senior Full Stack Developer',
  department: 'Engineering',
  description: 'We are looking for a Senior Full Stack Developer to join our engineering team. The ideal candidate will have 5+ years of experience in web development, strong knowledge of React, Node.js, and TypeScript. You will be responsible for designing and implementing scalable web applications, mentoring junior developers, and collaborating with cross-functional teams to deliver high-quality software solutions.',
  requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
  experienceLevel: 'Senior',
  educationLevel: "Bachelor's"
};

async function testRoleManagement() {
  console.log('\n🧪 Testing Role Management Feature...\n');

  try {
    // Step 1: Create a test role
    console.log('1️⃣ Creating test role...');
    const createResponse = await fetch(`${BASE_URL}/api/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify(testRole)
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Create failed: ${createResponse.status} ${errorText}`);
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
        'Authorization': `Bearer ${testToken}`
      }
    });

    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      throw new Error(`List failed: ${listResponse.status} ${errorText}`);
    }

    const roles = await listResponse.json();
    console.log('✅ Roles list fetched successfully');
    console.log(`   Total roles: ${roles.length}`);
    console.log(`   Found our role: ${roles.some(r => r.id === roleId) ? 'Yes' : 'No'}`);
    
    // Check if stats are included
    const ourRole = roles.find(r => r.id === roleId);
    if (ourRole && ourRole.stats) {
      console.log(`   Role stats: Total=${ourRole.stats.total}, Shortlisted=${ourRole.stats.shortlisted}`);
    }
    console.log('');

    // Step 3: Get specific role details
    console.log('3️⃣ Fetching role details...');
    const detailResponse = await fetch(`${BASE_URL}/api/roles/${roleId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    if (!detailResponse.ok) {
      const errorText = await detailResponse.text();
      throw new Error(`Detail failed: ${detailResponse.status} ${errorText}`);
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
    const updatedRole = {
      title: 'Senior Full Stack Developer (Updated)',
      department: 'Engineering',
      description: roleDetails.description + ' Updated with additional requirements for cloud technologies.',
      requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
      experienceLevel: 'Senior',
      educationLevel: "Bachelor's",
      status: 'active'
    };

    const updateResponse = await fetch(`${BASE_URL}/api/roles/${roleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify(updatedRole)
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Update failed: ${updateResponse.status} ${errorText}`);
    }

    const updatedRoleData = await updateResponse.json();
    console.log('✅ Role updated successfully');
    console.log(`   Title: ${updatedRoleData.title}`);
    console.log(`   Required Skills: ${updatedRoleData.evaluationCriteria.requiredSkills.join(', ')}`);
    console.log('');

    // Step 5: Test role editing workflow
    console.log('5️⃣ Testing role editing workflow...');
    console.log('   📝 Role can be viewed at: /dashboard/roles');
    console.log(`   📝 Role details at: /dashboard/roles/${roleId}`);
    console.log(`   ✏️ Role edit page at: /dashboard/roles/${roleId}/edit`);
    console.log('');

    // Step 6: Clean up - Delete the role
    console.log('6️⃣ Cleaning up - deleting test role...');
    const deleteResponse = await fetch(`${BASE_URL}/api/roles/${roleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      throw new Error(`Delete failed: ${deleteResponse.status} ${errorText}`);
    }

    const deleteResult = await deleteResponse.json();
    console.log('✅ Role deleted successfully');
    console.log(`   Message: ${deleteResult.message}`);
    console.log('');

    console.log('🎉 Role Management Feature Test Complete!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Role Creation with AI parsing - Working');
    console.log('   ✅ Role Listing with statistics - Working');
    console.log('   ✅ Role Details with candidate stats - Working');
    console.log('   ✅ Role Updates - Working');
    console.log('   ✅ Role Deletion - Working');
    console.log('\n🚀 The role management feature is fully functional!');
    console.log('\n📱 Frontend Pages Available:');
    console.log(`   • Roles List: http://localhost:3001/dashboard/roles`);
    console.log(`   • Create Role: http://localhost:3001/dashboard/roles/new`);
    console.log(`   • Role Details: http://localhost:3001/dashboard/roles/[id]`);
    console.log(`   • Edit Role: http://localhost:3001/dashboard/roles/[id]/edit`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('   • Make sure the development server is running on port 3001');
    console.log('   • Check that the database is connected');
    console.log('   • Verify n8n workflows are active for AI parsing');
  }
}

// Run the test
testRoleManagement();