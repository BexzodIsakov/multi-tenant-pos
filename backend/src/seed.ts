import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { Tenant } from './models/Tenant';
import { User } from './models/User';
import { Product } from './models/Product';

const DEMO_PASSWORD = 'pass123';

interface SeedProduct {
  name: string;
  sku: string;
  price: number;
  costPrice: number;
  stock: number;
  category: string;
  imageUrl: string;
}

const MILANO_PRODUCTS: SeedProduct[] = [
  { name: 'Margherita', sku: 'PIZZA-001', price: 12, costPrice: 4, stock: 25, category: 'Pizza', imageUrl: '/images/products/margherita.jpg' },
  { name: 'Pepperoni', sku: 'PIZZA-002', price: 13, costPrice: 4.5, stock: 30, category: 'Pizza', imageUrl: '/images/products/pepperoni.jpg' },
  { name: 'Four Cheese', sku: 'PIZZA-003', price: 14, costPrice: 5, stock: 20, category: 'Pizza', imageUrl: '/images/products/four_cheese.jpg' },
  { name: 'Veggie', sku: 'PIZZA-004', price: 12, costPrice: 4, stock: 22, category: 'Pizza', imageUrl: '/images/products/veggie.jpg' },
  { name: 'Chicken Ranch', sku: 'PIZZA-005', price: 14, costPrice: 5, stock: 18, category: 'Pizza', imageUrl: '/images/products/chicken_ranch.jpg' },
  { name: 'Mushroom & Olive', sku: 'PIZZA-006', price: 13, costPrice: 4.5, stock: 20, category: 'Pizza', imageUrl: '/images/products/mushrooms_olive.jpg' },
  // deliberately stock: 1, used to demo the no-oversell concurrency guarantee live
  { name: 'Pepperoni Mushroom', sku: 'PIZZA-007', price: 13.5, costPrice: 4.5, stock: 1, category: 'Pizza', imageUrl: '/images/products/pepperoni_mushrooms.jpg' },
  { name: 'Ice Tea', sku: 'MILANO-DRINK-001', price: 3, costPrice: 1, stock: 50, category: 'Drink', imageUrl: '/images/products/ice_tea.jpg' },
  { name: 'Ice Water', sku: 'MILANO-DRINK-002', price: 2, costPrice: 0.5, stock: 60, category: 'Drink', imageUrl: '/images/products/ice_water.jpg' },
  { name: 'Orange Juice', sku: 'MILANO-DRINK-003', price: 4, costPrice: 1.3, stock: 40, category: 'Drink', imageUrl: '/images/products/orange_juice.jpg' },
  { name: 'Apple Juice', sku: 'MILANO-DRINK-004', price: 4, costPrice: 1.3, stock: 40, category: 'Drink', imageUrl: '/images/products/apple_juice.jpg' },
  { name: 'Lemonade', sku: 'MILANO-DRINK-005', price: 3.5, costPrice: 1, stock: 35, category: 'Drink', imageUrl: '/images/products/lemonade.jpg' },
  { name: 'Mojito', sku: 'MILANO-DRINK-006', price: 5, costPrice: 1.5, stock: 30, category: 'Drink', imageUrl: '/images/products/mojito.jpg' }
];

const SWEET_CORNER_PRODUCTS: SeedProduct[] = [
  { name: 'Cheesecake', sku: 'PASTRY-001', price: 6, costPrice: 2, stock: 20, category: 'Pastry', imageUrl: '/images/products/cheesecake.jpg' },
  // deliberately stock: 1, used to demo the no-oversell concurrency guarantee live
  { name: 'Tiramisu', sku: 'PASTRY-002', price: 6.5, costPrice: 2.2, stock: 1, category: 'Pastry', imageUrl: '/images/products/tiramisu.jpg' },
  { name: 'Croissant', sku: 'PASTRY-003', price: 4, costPrice: 1.2, stock: 40, category: 'Pastry', imageUrl: '/images/products/croissant.jpg' },
  { name: 'Chocolate Cake', sku: 'PASTRY-004', price: 7, costPrice: 2.5, stock: 18, category: 'Pastry', imageUrl: '/images/products/chocolate_cake.jpg' },
  { name: 'Cinnamon Roll', sku: 'PASTRY-005', price: 4.5, costPrice: 1.4, stock: 30, category: 'Pastry', imageUrl: '/images/products/cinnamon_roll.jpg' },
  { name: 'Milkshake', sku: 'SWEETCORNER-DRINK-001', price: 5.5, costPrice: 1.8, stock: 25, category: 'Drink', imageUrl: '/images/products/milkshake.jpg' },
  { name: 'Tea', sku: 'SWEETCORNER-DRINK-002', price: 2.5, costPrice: 0.6, stock: 45, category: 'Drink', imageUrl: '/images/products/tea.jpg' },
  { name: 'Cappuccino', sku: 'SWEETCORNER-DRINK-003', price: 4, costPrice: 1.2, stock: 35, category: 'Drink', imageUrl: '/images/products/cappucino.jpg' },
  { name: 'Ice Water', sku: 'SWEETCORNER-DRINK-004', price: 2, costPrice: 0.5, stock: 60, category: 'Drink', imageUrl: '/images/products/ice_water.jpg' },
  { name: 'Ice Tea', sku: 'SWEETCORNER-DRINK-005', price: 3, costPrice: 1, stock: 50, category: 'Drink', imageUrl: '/images/products/ice_tea.jpg' }
];

export async function seedDatabase(): Promise<void> {
  const existingTenantCount = await Tenant.countDocuments();
  if (existingTenantCount > 0) {
    console.log('Seed data already present, skipping seed.');
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const [milano] = await Tenant.create([{ name: 'Milano Pizza' }], { session });
      const [sweetCorner] = await Tenant.create([{ name: 'Sweet Corner' }], { session });

      await User.create(
        [
          { tenantId: milano._id, role: 'admin', email: 'admin@milano.test', passwordHash },
          { tenantId: milano._id, role: 'cashier', email: 'cashier@milano.test', passwordHash },
          { tenantId: sweetCorner._id, role: 'admin', email: 'admin@sweetcorner.test', passwordHash },
          { tenantId: sweetCorner._id, role: 'cashier', email: 'cashier@sweetcorner.test', passwordHash }
        ],
        { session }
      );

      await Product.insertMany(
        MILANO_PRODUCTS.map((product) => ({ ...product, tenantId: milano._id })),
        { session }
      );
      await Product.insertMany(
        SWEET_CORNER_PRODUCTS.map((product) => ({ ...product, tenantId: sweetCorner._id })),
        { session }
      );
    });
  } finally {
    await session.endSession();
  }

  console.log('Seeded database with demo tenants, users, and products.');
  console.log('Demo login credentials (password is the same for all):');
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log('  admin@milano.test / cashier@milano.test');
  console.log('  admin@sweetcorner.test / cashier@sweetcorner.test');
}
