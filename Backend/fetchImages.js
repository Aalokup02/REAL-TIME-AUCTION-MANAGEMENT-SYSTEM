// Development utility: retrieves product image URLs and writes imageMap.json.
const google = require('googlethis');
const fs = require('fs');

const itemNames = [
  "Titan Edge Watch", "Fastrack Reflex Smartwatch", "Sonata Gold Watch", "HMT Janata Vintage Watch", "Noise ColorFit", "Boat Xtend Watch", "Maxima Attivo", "Helix Timex", "Pebble Cosmos", "Fire-Boltt Ninja",
  "Madhubani Canvas Painting", "Warli Wall Art", "Tanjore Painting", "Pattachitra Scroll", "Gond Art Canvas", "Rajasthani Miniature Painting", "Kalamkari Cloth Painting", "Phad Scroll Art", "Pichwai Artwork", "Kalighat Painting",
  "Boat Airdopes Earbuds", "Noise Smart Watch", "Micromax Mobile", "Zebronics Soundbar", "Portronics Powerbank", "Lava Agni 5G", "Symphony Air Cooler", "Godrej Refrigerator", "Havells Fan", "Bajaj Iron",
  "Kundan Necklace Set", "Polki Earrings", "Meenakari Bangle", "Temple Jewellery Necklace", "Thewa Gold Pendant", "Jadau Choker", "Terracotta Jhumkas", "Silver Payal", "Gold Mangalsutra", "Traditional Nath (Nose Ring)",
  "Brass Nataraja Statue", "Vintage Bidriware Vase", "Wooden Chettinad Box", "Dhokra Brass Figurine", "Kutch Embroidery Wall Hanging", "Antique Uruli", "Tanjore Dancing Doll", "Bidri Trinket Box", "Wooden Jharokha", "Antique East India Company Coin",
  "Acoustic Sitar", "Classical Tabla Set", "Wooden Harmonium", "Bansuri Bamboo Flute", "Traditional Dholak", "Saraswati Veena", "Indian Sarod", "Carnatic Mridangam", "Wedding Shehnai", "Classical Ghungroo",
  "Simpex Tripod Stand", "Digitek Ring Light", "Osaka Studio Umbrella", "Sonia Camera Bag", "Godox India Flash", "Pre-wedding Studio Backdrop", "Handmade Wooden Photo Frame", "Indian Royal Wedding Album", "Vintage Kodak Chrome Film", "Local Vintage Viewmaster",
  "Teakwood Jhoola (Swing)", "Sheesham Wood Cot", "Rajasthani Charpai", "Cane Bamboo Chair", "Hand-Carved Teak Sofa", "Jodhpur Wooden Table", "Sankheda Chair", "Kashmiri Walnut Wood Table", "Wicker Basket Chair", "Teak Wood Almirah",
  "Malgudi Days Book", "The Discovery of India", "God of Small Things", "The White Tiger Book", "Bhagavad Gita Hardcover", "Chacha Chaudhary Comic Book", "Amar Chitra Katha Set", "Ponniyin Selvan English Volume", "Midnight's Children", "Ignited Minds APJ Abdul Kalam",
  "Banarasi Silk Saree", "Kanjeevaram Silk", "Khadi Indian Kurta", "Kashmiri Pashmina Shawl", "Kolhapuri Chappal", "Chikankari Lehenga", "Phulkari Dupatta", "Bandhani Suit", "Jodhpuri Sherwani", "Mysore Silk Tie",
  "SG Cricket Bat", "SS Ton Cricket Bat", "Cosco Tennis Ball Set", "Nivia Football", "Vector X Badminton Racket", "Tyka Sports Jersey", "BDM Cricket Pads", "Jonex Carrom Board", "MRF Genius Cricket Bat", "GKI Table Tennis Racket",
  "Royal Enfield Classic 350", "Maruti Suzuki 800 Vintage", "Bajaj Chetak Scooter", "Mahindra Thar SUV", "Tata Safari", "TVS Jupiter", "Classic Ambassador Car", "Hero Splendor Plus", "Ola S1 Pro Electric Scooter", "Bajaj Pulsar 150"
];

async function fetchImages() {
  const map = {};
  console.log(`Starting fetch for ${itemNames.length} Indian items...`);
  
  for(let i = 0; i < itemNames.length; i++) {
    const item = itemNames[i];
    try {
      const images = await google.image(item + " high quality product photo", { safe: false });
      
      let validUrl = null;
      for (const img of images) {
          if (img.url && img.url.startsWith("http")) {
              validUrl = img.url;
              break;
          }
      }
      
      if (validUrl) {
          map[item] = validUrl;
          console.log(`[${i+1}/${itemNames.length}] Found: ${item}`);
      } else {
          throw new Error("No valid HTTP URL found");
      }
    } catch(err) {
      console.log(`[${i+1}/${itemNames.length}] Failed: ${item}`);
      map[item] = `https://loremflickr.com/600/600/${encodeURIComponent(item.split(' ')[0])}`;
    }
  }
  
  fs.writeFileSync('imageMap.json', JSON.stringify(map, null, 2));
  console.log("Successfully wrote completely Indian mapped image URLs to imageMap.json!");
}

fetchImages();
