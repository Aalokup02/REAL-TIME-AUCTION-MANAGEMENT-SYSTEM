// seed.js ? Create 240 image-backed demo auctions (20 per category).
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/user.model");
const Auction = require("./models/auction.model");
const Bid = require("./models/bid.model");

const categories = [
  "Watches",
  "Art",
  "Electronics",
  "Jewellery",
  "Antiques",
  "Music",
  "Photography",
  "Furniture",
  "Books",
  "Fashion",
  "Sports",
  "Vehicles",
];

// Image selection: use a curated URL first, otherwise use a product-name fallback.
const imageMap = require('./imageMap.json');

const getImg = (itemName, index) => {
  const url = imageMap[itemName] || `https://loremflickr.com/600/600/${encodeURIComponent(itemName.split(' ')[0])}?lock=${index + 1}`;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=600&h=600&fit=cover`;
};

// Product catalogue: each entry is on its own line for easy editing.
// Add or remove a product name here; the seed logic supplies its image URL.
const itemNames = {
  Watches: [
    "Titan Edge Watch",
    "Fastrack Reflex Smartwatch",
    "Sonata Gold Watch",
    "HMT Janata Vintage Watch",
    "Noise ColorFit",
    "Boat Xtend Watch",
    "Maxima Attivo",
    "Helix Timex",
    "Pebble Cosmos",
    "Fire-Boltt Ninja",
  ],
  Art: [
    "Madhubani Canvas Painting",
    "Warli Wall Art",
    "Tanjore Painting",
    "Pattachitra Scroll",
    "Gond Art Canvas",
    "Rajasthani Miniature Painting",
    "Kalamkari Cloth Painting",
    "Phad Scroll Art",
    "Pichwai Artwork",
    "Kalighat Painting",
  ],
  Electronics: [
    "Boat Airdopes Earbuds",
    "Noise Smart Watch",
    "Micromax Mobile",
    "Zebronics Soundbar",
    "Portronics Powerbank",
    "Lava Agni 5G",
    "Symphony Air Cooler",
    "Godrej Refrigerator",
    "Havells Fan",
    "Bajaj Iron",
  ],
  Jewellery: [
    "Kundan Necklace Set",
    "Polki Earrings",
    "Meenakari Bangle",
    "Temple Jewellery Necklace",
    "Thewa Gold Pendant",
    "Jadau Choker",
    "Terracotta Jhumkas",
    "Silver Payal",
    "Gold Mangalsutra",
    "Traditional Nath (Nose Ring)",
  ],
  Antiques: [
    "Brass Nataraja Statue",
    "Vintage Bidriware Vase",
    "Wooden Chettinad Box",
    "Dhokra Brass Figurine",
    "Kutch Embroidery Wall Hanging",
    "Antique Uruli",
    "Tanjore Dancing Doll",
    "Bidri Trinket Box",
    "Wooden Jharokha",
    "Antique East India Company Coin",
  ],
  Music: [
    "Acoustic Sitar",
    "Classical Tabla Set",
    "Wooden Harmonium",
    "Bansuri Bamboo Flute",
    "Traditional Dholak",
    "Saraswati Veena",
    "Indian Sarod",
    "Carnatic Mridangam",
    "Wedding Shehnai",
    "Classical Ghungroo",
  ],
  Photography: [
    "Simpex Tripod Stand",
    "Digitek Ring Light",
    "Osaka Studio Umbrella",
    "Sonia Camera Bag",
    "Godox India Flash",
    "Pre-wedding Studio Backdrop",
    "Handmade Wooden Photo Frame",
    "Indian Royal Wedding Album",
    "Vintage Kodak Chrome Film",
    "Local Vintage Viewmaster",
  ],
  Furniture: [
    "Teakwood Jhoola (Swing)",
    "Sheesham Wood Cot",
    "Rajasthani Charpai",
    "Cane Bamboo Chair",
    "Hand-Carved Teak Sofa",
    "Jodhpur Wooden Table",
    "Sankheda Chair",
    "Kashmiri Walnut Wood Table",
    "Wicker Basket Chair",
    "Teak Wood Almirah",
  ],
  Books: [
    "Malgudi Days Book",
    "The Discovery of India",
    "God of Small Things",
    "The White Tiger Book",
    "Bhagavad Gita Hardcover",
    "Chacha Chaudhary Comic Book",
    "Amar Chitra Katha Set",
    "Ponniyin Selvan English Volume",
    "Midnight's Children",
    "Ignited Minds APJ Abdul Kalam",
  ],
  Fashion: [
    "Banarasi Silk Saree",
    "Kanjeevaram Silk",
    "Khadi Indian Kurta",
    "Kashmiri Pashmina Shawl",
    "Kolhapuri Chappal",
    "Chikankari Lehenga",
    "Phulkari Dupatta",
    "Bandhani Suit",
    "Jodhpuri Sherwani",
    "Mysore Silk Tie",
  ],
  Sports: [
    "SG Cricket Bat",
    "SS Ton Cricket Bat",
    "Cosco Tennis Ball Set",
    "Nivia Football",
    "Vector X Badminton Racket",
    "Tyka Sports Jersey",
    "BDM Cricket Pads",
    "Jonex Carrom Board",
    "MRF Genius Cricket Bat",
    "GKI Table Tennis Racket",
  ],
  Vehicles: [
    "Royal Enfield Classic 350",
    "Maruti Suzuki 800 Vintage",
    "Bajaj Chetak Scooter",
    "Mahindra Thar SUV",
    "Tata Safari",
    "TVS Jupiter",
    "Classic Ambassador Car",
    "Hero Splendor Plus",
    "Ola S1 Pro Electric Scooter",
    "Bajaj Pulsar 150",
  ],
};

// Add ten generated products per category so every category reaches 20 products.
const additionalItemNames = Object.fromEntries(categories.map(category => [
  category,
  Array.from({ length: 10 }, (_, index) => `${category} Collector Edition ${index + 1}`)
]));

// Combine the curated and generated products before creating auctions.
for (const category of categories) {
  itemNames[category].push(...additionalItemNames[category]);
}

const PRODUCTS_PER_CATEGORY = 20;
const ONGOING_PER_CATEGORY = 12;
const UPCOMING_PER_CATEGORY = 4;

// Main workflow: reset demo data, create users, then create auctions and bids.
async function seed() {
  // Step 1: Connect to MongoDB using MONGO_URI from .env.
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  // Step 2: Remove old demo data before inserting fresh records.
  await User.deleteMany({});
  await Auction.deleteMany({});
  await Bid.deleteMany({});
  console.log("Cleared old data");

  // Step 3: Create one seller and four buyers for the demo bid history.
  const hashedPass = await bcrypt.hash("password123", 10);
  const seller = await User.create({ name: "Abdulla", email: "abdulla@seller.com", password: hashedPass, role: "seller" });
  const buyer1 = await User.create({ name: "Rahul", email: "rahul@buyer.com", password: hashedPass, role: "buyer" });
  const buyer2 = await User.create({ name: "Priya", email: "priya@buyer.com", password: hashedPass, role: "buyer" });
  const buyer3 = await User.create({ name: "Amit", email: "amit@buyer.com", password: hashedPass, role: "buyer" });
  const buyer4 = await User.create({ name: "Sarah", email: "sarah@buyer.com", password: hashedPass, role: "buyer" });
  console.log("Created users");

  const buyers = [buyer1, buyer2, buyer3, buyer4];
  const now = new Date();
  const hr = 3600000;
  
  let allAuctionsData = [];

  // Create 12 live, 4 upcoming, and 4 closed auctions per category.
  // Live and closed auctions receive bid history; upcoming auctions do not.
  categories.forEach(cat => {
    for (let i = 0; i < PRODUCTS_PER_CATEGORY; i++) {
      // Set the auction timing and bid value for the current product.
       let status = "active";
       let startOffset, endOffset, currentBid;

       if (i < ONGOING_PER_CATEGORY) {
          startOffset = - (i + 1) * hr;
          endOffset   = 48 * hr + 5 * 60000 + (i + 1) * 2 * hr;
          currentBid  = (i + 1) * 3500;
       } else if (i < ONGOING_PER_CATEGORY + UPCOMING_PER_CATEGORY) {
          startOffset = (i + 1) * hr;
          endOffset   = 48 * hr + 5 * 60000 + (i + 5) * 4 * hr;
          currentBid  = 0;
       } else {
          startOffset = - (i + PRODUCTS_PER_CATEGORY) * hr;
          endOffset   = - (i + 1) * hr;
          status      = "closed";
          currentBid  = (i + 1) * 5000;
       }

       const itemName = itemNames[cat][i];
       // Pick a random winner from the buyers if it has bids
       const winner = buyers[(i * cat.length) % buyers.length];
       
       allAuctionsData.push({
         seller_id: seller._id,
         item_name: itemName,
         category: cat,
         image_url: getImg(itemName, categories.indexOf(cat) * PRODUCTS_PER_CATEGORY + i),
         description: `This highly sought-after ${itemName.toLowerCase()} is offered with full authentication. Perfect condition. Don't miss out.`,
         start_time: new Date(now.getTime() + startOffset),
         end_time: new Date(now.getTime() + endOffset),
         current_highest_bid: currentBid,
         highest_bidder_id: (currentBid > 0) ? winner._id : null,
         status: status
       });
    }
  });

  // Step 4: Save all auction listings in one database operation.
  const insertedAuctions = await Auction.insertMany(allAuctionsData);
  console.log(`Created ${insertedAuctions.length} auctions (${PRODUCTS_PER_CATEGORY} per category).`);

  // Step 5: Add three historical bids to every live or closed auction.
  const bidData = [];
  for (let aIdx = 0; aIdx < insertedAuctions.length; aIdx++) {
      const auction = insertedAuctions[aIdx];
      if (auction.current_highest_bid > 0) {
          const amounts = [auction.current_highest_bid - 2000, auction.current_highest_bid - 1000, auction.current_highest_bid];
          for (let i = 0; i < amounts.length; i++) {
              if (amounts[i] > 0) {
                  // Ensure the last bid is by the designated highest_bidder, previous bids by others
                  let bidUserId = auction.highest_bidder_id;
                  if (i < amounts.length - 1) {
                      bidUserId = buyers[(aIdx + i + 1) % buyers.length]._id;
                  }
                  
                  bidData.push({
                      auction_id: auction._id,
                      bidder_id: bidUserId,
                      bid_amount: amounts[i],
                      timestamp: new Date(now.getTime() - (amounts.length - i) * 30 * 60000)
                  });
              }
          }
      }
  }
  await Bid.insertMany(bidData);
  console.log("Created bid history");

  console.log("\\n✅ Seed complete! ${insertedAuctions.length} image-backed auctions generated successfully.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
