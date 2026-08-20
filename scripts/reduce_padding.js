const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'components', 'public');
const filesToUpdate = [
  'TestimonialsSection.tsx',
  'WhyChooseUs.tsx',
  'SellCarCTA.tsx',
  'FeaturedInventory.tsx',
  'FAQSection.tsx',
  'BuyingProcess.tsx',
  'BrowseByCategory.tsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(componentsDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace <section className="py-12 and py-10 with py-8 lg:py-10
    content = content.replace(/className="py-12\b/g, 'className="py-8 lg:py-10');
    content = content.replace(/className="py-10\b/g, 'className="py-8 lg:py-10');
    
    // BrowseByCategory specific: reduce mb-10 to mb-6 on header
    if (file === 'BrowseByCategory.tsx') {
      content = content.replace(/className="text-center mb-10"/g, 'className="text-center mb-6"');
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated padding in ${file}`);
  }
});
