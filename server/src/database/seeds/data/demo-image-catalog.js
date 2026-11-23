export const DEMO_IMAGE_CATALOG = {
  Phones: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab",
    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5",
  ],
  Audio: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b",
  ],
  Laptops: [
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
  ],
  Accessories: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
  ],
  Men: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f",
    "https://images.unsplash.com/photo-1490578474895-699cd4e2cfb6",
  ],
  Women: [
    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b",
  ],
  Kitchen: [
    "https://images.unsplash.com/photo-1556911220-bff31c812dba",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
    "https://images.unsplash.com/photo-1556911073-38141963c9e0",
  ],
  Furniture: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36",
    "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6",
  ],
  Skincare: [
    "https://images.unsplash.com/photo-1556228578-8c89e6adf883",
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b",
    "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8",
  ],
  Makeup: [
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba496",
  ],
  Fitness: [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    "https://images.unsplash.com/photo-1517963879433-6ad2b056d712",
    "https://images.unsplash.com/photo-1538805060514-97d9cc17730c",
  ],
  Outdoor: [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4",
    "https://images.unsplash.com/photo-1475483768296-6163e08872a1",
  ],
  Games: [
    "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09",
    "https://images.unsplash.com/photo-1611373410175-8f6e0e1e8d1d",
    "https://images.unsplash.com/photo-1606167668584-787d75a7788c",
  ],
  Learning: [
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
  ],
  Fiction: [
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d",
    "https://images.unsplash.com/photo-1516979187457-637abb4f9353",
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
  ],
  "Car Care": [
    "https://images.unsplash.com/photo-1489824904134-891ab64532f1",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
  ],
};

export function demoSubcategoryForProductNumber(productNumber) {
  const names = Object.keys(DEMO_IMAGE_CATALOG);
  return names[(productNumber - 1) % names.length];
}

export function getDemoImageUrl(subcategoryName, productNumber) {
  const candidates = DEMO_IMAGE_CATALOG[subcategoryName] ?? DEMO_IMAGE_CATALOG.Accessories;
  return `${candidates[(productNumber - 1) % candidates.length]}?auto=format&fit=crop&w=800&h=800&q=82&shopsphere_demo=${productNumber}`;
}
