export default class Product {
  constructor(name) {
    this.name = name;
    this.reviews = [];
  }
  
  addReview(review) {
    this.reviews.push({ review });
  }
  
  getReviews() {
    return this.reviews;
  }
}