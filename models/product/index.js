let id = 0;

export default class Product {
  constructor(name) {
    this.name = name;
    this.id = id++;
    this.reviews = [];
  }
  
  addReview(review) {
    this.reviews.push({ review });
  }
  
  getReviews() {
    return this.reviews;
  }
}