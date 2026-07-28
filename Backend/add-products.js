// Development utility: adds additional auction listings for an existing seller.
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/user.model");
const Auction = require("./models/auction.model");

const fakeItems = [
  { name: "Sony Alpha a7 IV", cat: "Photography", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80", desc: "A great mirrorless camera." },
  { name: "Tesla Model S Toy Car", cat: "Toys", img: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=600&q=80", desc: "Detailed 1:18 die cast." },
  { name: "Bose QuietComfort 45", cat: "Electronics", img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80", desc: "Noise-cancelling headphones." },
  { name: "KitchenAid Mixer", cat: "Appliances", img: "https://images.unsplash.com/photo-1593998066526-65fcab3021a2?auto=format&fit=crop&w=600&q=80", desc: "Artisan series 5-qt stand mixer." },
  { name: "Leather Office Chair", cat: "Furniture", img: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=600&q=80", desc: "Ergonomic leather chair." },
  { name: "Nintendo Switch OLED", cat: "Gaming", img: "https://images.unsplash.com/photo-1617096200347-cb04ae810b1d?auto=format&fit=crop&w=600&q=80", desc: "Console with white Joy-Con." },
  { name: "Yamaha Acoustic Guitar", cat: "Music", img: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80", desc: "High-quality acoustic guitar." },
  { name: "iPad Pro 12.9", cat: "Electronics", img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80", desc: "M2 chip, 256GB." },
  { name: "Casio G-Shock", cat: "Watches", img: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=600&q=80", desc: "Durable digital watch." },
  { name: "Dyson V15 Vacuum", cat: "Appliances", img: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80", desc: "Cordless stick vacuum." },
  { name: "Samsung 65' OLED TV", cat: "Electronics", img: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80", desc: "4K smart TV." },
  { name: "Nike Air Max 97", cat: "Fashion", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", desc: "Classic sneakers." },
  { name: "Ray-Ban Aviators", cat: "Fashion", img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80", desc: "Classic sunglasses." },
  { name: "Oculus Quest 2", cat: "Gaming", img: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=600&q=80", desc: "VR headset." },
  { name: "GoPro HERO11", cat: "Photography", img: "https://images.unsplash.com/photo-1500634245200-e5245c7574ef?auto=format&fit=crop&w=600&q=80", desc: "Action camera." },
  { name: "Instant Pot Duo", cat: "Appliances", img: "https://images.unsplash.com/photo-1588724212727-b50a25501fb3?auto=format&fit=crop&w=600&q=80", desc: "7-in-1 multi-cooker." },
  { name: "YETI Tundra Cooler", cat: "Outdoors", img: "https://images.unsplash.com/photo-1510006769151-5182e1858e8b?auto=format&fit=crop&w=600&q=80", desc: "Hard cooler for camping." },
  { name: "Weber Grill", cat: "Outdoors", img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80", desc: "Gas BBQ grill." },
  { name: "Apple Watch Series 9", cat: "Watches", img: "https://images.unsplash.com/photo-1434493789847-2f02bfa4041e?auto=format&fit=crop&w=600&q=80", desc: "Smart watch." },
  { name: "Lego Star Wars Falcon", cat: "Toys", img: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80", desc: "Millennium Falcon kit." },
  { name: "Herman Miller Aeron", cat: "Furniture", img: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=600&q=80", desc: "Premium office chair." },
  { name: "Kindle Paperwhite", cat: "Electronics", img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80", desc: "E-reader." },
  { name: "DJI Mini 3 Pro", cat: "Photography", img: "https://images.unsplash.com/photo-1473968512647-3e447b9735d4?auto=format&fit=crop&w=600&q=80", desc: "Drone with camera." },
  { name: "Fitbit Charge 5", cat: "Electronics", img: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=600&q=80", desc: "Fitness tracker." },
  { name: "Razer DeathAdder V3", cat: "Gaming", img: "https://images.unsplash.com/photo-1527814050087-379381547996?auto=format&fit=crop&w=600&q=80", desc: "Gaming mouse." },
  { name: "Corsair K70 Keyboard", cat: "Gaming", img: "https://images.unsplash.com/photo-1511467687858-23d386411f15?auto=format&fit=crop&w=600&q=80", desc: "Mechanical keyboard." },
  { name: "North Face Jacket", cat: "Fashion", img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80", desc: "Winter jacket." },
  { name: "Patagonia Backpack", cat: "Outdoors", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80", desc: "Daypack." },
  { name: "Hydro Flask 32oz", cat: "Outdoors", img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80", desc: "Insulated water bottle." },
  { name: "Le Creuset Dutch Oven", cat: "Appliances", img: "https://images.unsplash.com/photo-1584284534720-30db004383c2?auto=format&fit=crop&w=600&q=80", desc: "Cast iron cookware." }
];

async function addMoreProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    const seller = await User.findOne({ role: "seller" });
    if (!seller) {
      console.log("No seller found.");
      process.exit(1);
    }

    const now = new Date();
    const productsToAdd = [];

    // Let's create 15 ongoing and 15 upcoming from the fakeItems array
    for (let i = 0; i < fakeItems.length; i++) {
      const item = fakeItems[i];
      let isOngoing = i < 15;

      productsToAdd.push({
        seller_id: seller._id,
        item_name: item.name,
        category: item.cat,
        image_url: item.img,
        description: item.desc,
        start_time: isOngoing ? new Date(now.getTime() - (i + 1) * 3600000) : new Date(now.getTime() + (i * 2 + 1) * 3600000),
        end_time: isOngoing ? new Date(now.getTime() + (i * 2 + 5) * 3600000) : new Date(now.getTime() + (i * 4 + 10) * 3600000),
        current_highest_bid: isOngoing ? (i + 1) * 50 : 0,
        status: "active"
      });
    }

    await Auction.insertMany(productsToAdd);
    console.log(`Successfully added ${productsToAdd.length} products! (15 ongoing, 15 upcoming)`);

    process.exit(0);
  } catch (err) {
    console.error("Error adding products:", err);
    process.exit(1);
  }
}

addMoreProducts();
