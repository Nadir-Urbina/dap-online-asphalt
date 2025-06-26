const sampleProducts = [
  {
    productId: 'TOOL-001',
    type: 'tool',
    name: 'Industrial Shovel',
    description: 'Heavy-duty steel shovel for asphalt and construction work',
    price: 45.99,
    stock: 25,
    minStock: 5,
    category: 'Hand Tools',
    manufacturer: 'Stanley',
    active: true
  },
  {
    productId: 'TOOL-002', 
    type: 'tool',
    name: 'Asphalt Rake',
    description: 'Professional asphalt rake with ergonomic handle',
    price: 89.99,
    stock: 15,
    minStock: 3,
    category: 'Hand Tools',
    manufacturer: 'Bon Tool',
    active: true
  },
  {
    productId: 'EQU-001',
    type: 'equipment',
    name: 'Plate Compactor',
    description: 'Gas-powered plate compactor for asphalt compaction',
    price: 1299.99,
    stock: 3,
    minStock: 1,
    category: 'Compaction Equipment',
    manufacturer: 'Wacker Neuson',
    active: true
  },
  {
    productId: 'PART-001',
    type: 'part',
    name: 'Conveyor Belt',
    description: 'Replacement conveyor belt for asphalt plant',
    price: 899.99,
    stock: 2,
    minStock: 2,
    category: 'Plant Parts',
    manufacturer: 'ContiTech',
    active: true
  },
  {
    productId: 'SUP-001',
    type: 'supplies',
    name: 'Safety Cones',
    description: 'Orange traffic cones for job site safety (pack of 12)',
    price: 79.99,
    stock: 8,
    minStock: 5,
    category: 'Safety Supplies',
    manufacturer: 'Cortina Safety',
    active: true
  },
  {
    productId: 'TOOL-003',
    type: 'tool',
    name: 'Thermometer Gun',
    description: 'Infrared thermometer for asphalt temperature readings',
    price: 149.99,
    stock: 4,
    minStock: 2,
    category: 'Measuring Tools',
    manufacturer: 'Fluke',
    active: true
  }
];

async function createSampleProducts() {
  console.log('Creating sample products...');
  
  for (const product of sampleProducts) {
    try {
      const response = await fetch('http://localhost:3111/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Created: ${product.name} (${product.productId})`);
      } else {
        const error = await response.json();
        console.log(`❌ Failed to create ${product.name}: ${error.error}`);
      }
    } catch (error) {
      console.log(`❌ Error creating ${product.name}:`, error.message);
    }
  }

  console.log('\n🎉 Sample product creation complete!');
  console.log('📊 Products created:');
  console.log(`   - ${sampleProducts.filter(p => p.type === 'tool').length} Tools`);
  console.log(`   - ${sampleProducts.filter(p => p.type === 'equipment').length} Equipment`);
  console.log(`   - ${sampleProducts.filter(p => p.type === 'part').length} Parts`);
  console.log(`   - ${sampleProducts.filter(p => p.type === 'supplies').length} Supplies`);
  console.log('\n🔗 Visit http://localhost:3111/admin to manage products');
}

// Run the script
createSampleProducts().catch(console.error); 