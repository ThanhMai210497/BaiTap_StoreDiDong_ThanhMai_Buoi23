export default class Product {
  constructor({ id, name, price, category, img, images = [], desc }) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.category = category;
    this.img = img;
    this.images = images;
    this.desc = desc;
  }
}
