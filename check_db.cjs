const mongoose = require('mongoose');

// HARDCODED URI FOR DIAGNOSTICS
const MONGO_URI = "mongodb+srv://asmitajethva52_db_user:asmitajethva52@cluster0.a0f7qyu.mongodb.net/?appName=Cluster0";

const PageBannerSchema = new mongoose.Schema({
  pageKey: String,
  isActive: Boolean,
  image: { src: String }
}, { strict: false });

const PageBanner = mongoose.model('PageBannerDiag', PageBannerSchema, 'pagebanners');

async function check() {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");
    const banners = await PageBanner.find({});
    console.log("Found Banners Data:");
    console.log(JSON.stringify(banners.map(b => ({ 
        pageKey: b.pageKey, 
        isActive: b.isActive, 
        imageSrc: b.image ? b.image.src : 'MISSING' 
    })), null, 2));
    process.exit(0);
  } catch (err) {
    console.error("ERROR:", err);
    process.exit(1);
  }
}

check();
