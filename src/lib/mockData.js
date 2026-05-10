export const MOCK_RESTAURANTS = [
  {
    id: "r1",
    name: "Burger Palace",
    cuisine: "American",
    rating: 4.8,
    delivery_time: "20-30 min",
    delivery_fee: 1.99,
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    address: "123 Main St",
    is_open: true,
    tags: ["Burgers", "Fast Food", "American"]
  },
  {
    id: "r2",
    name: "Sushi Zen",
    cuisine: "Japanese",
    rating: 4.9,
    delivery_time: "30-45 min",
    delivery_fee: 2.99,
    image_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80",
    address: "456 Oak Ave",
    is_open: true,
    tags: ["Sushi", "Japanese", "Healthy"]
  },
  {
    id: "r3",
    name: "Pizza Roma",
    cuisine: "Italian",
    rating: 4.7,
    delivery_time: "25-40 min",
    delivery_fee: 0.99,
    image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
    address: "789 Elm Rd",
    is_open: true,
    tags: ["Pizza", "Italian", "Pasta"]
  },
  {
    id: "r4",
    name: "Spice Garden",
    cuisine: "Indian",
    rating: 4.6,
    delivery_time: "35-50 min",
    delivery_fee: 1.49,
    image_url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80",
    address: "321 Spice Lane",
    is_open: true,
    tags: ["Indian", "Curry", "Vegetarian"]
  },
  {
    id: "r5",
    name: "Taco Fiesta",
    cuisine: "Mexican",
    rating: 4.5,
    delivery_time: "20-35 min",
    delivery_fee: 1.29,
    image_url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=80",
    address: "654 Fiesta Blvd",
    is_open: false,
    tags: ["Mexican", "Tacos", "Fast Food"]
  },
  {
    id: "r6",
    name: "Green Bowl",
    cuisine: "Healthy",
    rating: 4.7,
    delivery_time: "15-25 min",
    delivery_fee: 2.49,
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
    address: "987 Health Ave",
    is_open: true,
    tags: ["Healthy", "Salads", "Vegan"]
  }
];

export const MOCK_MENU_ITEMS = {
  r1: [
    { id: "m1", restaurant_id: "r1", name: "Classic Smash Burger", description: "Double smash patty, cheddar, special sauce", price: 12.99, category: "Burgers", image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" },
    { id: "m2", restaurant_id: "r1", name: "Bacon BBQ Burger", description: "Crispy bacon, BBQ sauce, onion rings", price: 14.99, category: "Burgers", image_url: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80" },
    { id: "m3", restaurant_id: "r1", name: "Crispy Fries", description: "Golden crispy fries with dipping sauce", price: 4.99, category: "Sides", image_url: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&q=80" },
    { id: "m4", restaurant_id: "r1", name: "Vanilla Milkshake", description: "Thick creamy vanilla milkshake", price: 6.99, category: "Drinks", image_url: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80" },
  ],
  r2: [
    { id: "m5", restaurant_id: "r2", name: "Salmon Nigiri (6pc)", description: "Fresh Atlantic salmon over seasoned rice", price: 16.99, category: "Nigiri", image_url: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80" },
    { id: "m6", restaurant_id: "r2", name: "Dragon Roll", description: "Shrimp tempura, avocado, eel sauce", price: 18.99, category: "Rolls", image_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80" },
    { id: "m7", restaurant_id: "r2", name: "Miso Soup", description: "Traditional miso with tofu and seaweed", price: 3.99, category: "Soups", image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80" },
    { id: "m8", restaurant_id: "r2", name: "Edamame", description: "Salted steamed soybeans", price: 5.99, category: "Starters", image_url: "https://images.unsplash.com/photo-1540648639573-8c848de23f0a?w=400&q=80" },
  ],
  r3: [
    { id: "m9", restaurant_id: "r3", name: "Margherita Pizza", description: "San Marzano tomato, fresh mozzarella, basil", price: 15.99, category: "Pizzas", image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80" },
    { id: "m10", restaurant_id: "r3", name: "Pepperoni Feast", description: "Double pepperoni, mozzarella, oregano", price: 17.99, category: "Pizzas", image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80" },
    { id: "m11", restaurant_id: "r3", name: "Spaghetti Carbonara", description: "Guanciale, egg, pecorino, black pepper", price: 14.99, category: "Pasta", image_url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=80" },
  ],
  r4: [
    { id: "m12", restaurant_id: "r4", name: "Butter Chicken", description: "Tender chicken in rich tomato-cream sauce", price: 16.99, category: "Mains", image_url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80" },
    { id: "m13", restaurant_id: "r4", name: "Garlic Naan", description: "Freshly baked naan with garlic butter", price: 3.99, category: "Breads", image_url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80" },
    { id: "m14", restaurant_id: "r4", name: "Mango Lassi", description: "Refreshing yogurt and mango drink", price: 4.99, category: "Drinks", image_url: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80" },
  ],
  r5: [
    { id: "m15", restaurant_id: "r5", name: "Street Tacos (3pc)", description: "Carnitas, onion, cilantro, salsa verde", price: 11.99, category: "Tacos", image_url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&q=80" },
  ],
  r6: [
    { id: "m16", restaurant_id: "r6", name: "Buddha Bowl", description: "Quinoa, roasted veggies, tahini dressing", price: 13.99, category: "Bowls", image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80" },
    { id: "m17", restaurant_id: "r6", name: "Acai Bowl", description: "Acai blend, granola, fresh berries", price: 11.99, category: "Bowls", image_url: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&q=80" },
  ],
};

export const MOCK_ORDERS = [
  {
    id: "ord1",
    customer_email: "customer@demo.com",
    driver_email: "driver@demo.com",
    items: [
      { menu_item_id: "m1", menu_item_name: "Classic Smash Burger", restaurant_id: "r1", restaurant_name: "Burger Palace", price: 12.99, quantity: 2 },
      { menu_item_id: "m3", menu_item_name: "Crispy Fries", restaurant_id: "r1", restaurant_name: "Burger Palace", price: 4.99, quantity: 1 },
    ],
    total_price: 30.97,
    delivery_address: "42 Customer Lane, Apt 5",
    status: "preparing",
    restaurants: ["Burger Palace"],
    estimated_delivery: "35 min"
  },
  {
    id: "ord2",
    customer_email: "customer@demo.com",
    driver_email: "driver@demo.com",
    items: [
      { menu_item_id: "m5", menu_item_name: "Salmon Nigiri", restaurant_id: "r2", restaurant_name: "Sushi Zen", price: 16.99, quantity: 1 },
      { menu_item_id: "m6", menu_item_name: "Dragon Roll", restaurant_id: "r2", restaurant_name: "Sushi Zen", price: 18.99, quantity: 1 },
    ],
    total_price: 35.98,
    delivery_address: "42 Customer Lane, Apt 5",
    status: "picked_up",
    restaurants: ["Sushi Zen"],
    estimated_delivery: "15 min"
  },
  {
    id: "ord3",
    customer_email: "user2@demo.com",
    driver_email: null,
    items: [
      { menu_item_id: "m9", menu_item_name: "Margherita Pizza", restaurant_id: "r3", restaurant_name: "Pizza Roma", price: 15.99, quantity: 1 },
    ],
    total_price: 15.99,
    delivery_address: "99 Maple Street",
    status: "pending",
    restaurants: ["Pizza Roma"],
    estimated_delivery: "40 min"
  },
];

export const DEMO_USERS = {
  "customer@demo.com": { password: "demo123", role: "customer", full_name: "Alex Johnson" },
  "driver@demo.com": { password: "demo123", role: "driver", full_name: "Marcus Rivera" },
  "owner@demo.com": { password: "demo123", role: "owner", full_name: "Sarah Chen" },
  "admin@demo.com": { password: "demo123", role: "admin", full_name: "Jordan Park" },
};