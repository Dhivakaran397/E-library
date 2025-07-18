const bookSchema = new mongoose.Schema({
   name: { type: String, required: true },         // ✅ Book name/title
   author: { type: String, required: true },       // ✅ Author of the book
   description: { type: String, required: true },  // ✅ Book summary or blurb
   price: { type: String, required: true },        // ✅ Book price (string instead of Number)
   category: { type: String, required: true },     // ✅ Genre (e.g., Fiction, Science, etc.)
   rating: { type: Number, required: true },       // ✅ Average rating (e.g., 4.5)
   image: { type: String, required: true }         // ✅ Image URL for the book cover
});
