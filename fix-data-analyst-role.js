// Script to fix the Data Analyst role with missing evaluationCriteria
// Run with: node fix-data-analyst-role.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDataAnalystRole() {
  try {
    console.log('Looking for Data Analyst role...');
    
    // Find the Data Analyst role
    const role = await prisma.role.findFirst({
      where: {
        title: 'Data Analyst'
      }
    });

    if (!role) {
      console.log('Data Analyst role not found');
      return;
    }

    console.log('Found role:', role.id);
    console.log('Current evaluationCriteria:', role.evaluationCriteria);

    // Check if evaluationCriteria needs normalization
    const criteria = role.evaluationCriteria;
    const needsUpdate = !criteria || 
                        typeof criteria.experienceLevel !== 'string' ||
                        typeof criteria.educationLevel !== 'string';

    if (needsUpdate) {
      console.log('Normalizing evaluationCriteria structure...');
      
      // Extract existing requiredSkills or use defaults
      const requiredSkills = criteria?.requiredSkills || ['SQL', 'Python', 'Excel', 'Tableau'];
      
      const updated = await prisma.role.update({
        where: { id: role.id },
        data: {
          evaluationCriteria: {
            requiredSkills: requiredSkills,
            experienceLevel: 'Mid-Level',
            educationLevel: "Bachelor's"
          }
        }
      });

      console.log('✅ Role updated successfully!');
      console.log('New evaluationCriteria:', updated.evaluationCriteria);
    } else {
      console.log('✅ Role already has valid evaluationCriteria structure');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDataAnalystRole();
